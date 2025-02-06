import { AgentHello, ExecutionRequest } from './protocol/protocol'
import { WebSocketClient } from './transport/sockets'
import { InitData } from './types/init'
import zodToJson from 'zod-to-json-schema'
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import nacl from 'tweetnacl'
import { decodeUTF8 } from 'tweetnacl-util'
import bs58 from 'bs58'
import { ValueContainer } from './services/value-container'
import { getApi } from './api'
import { v4 as uuid } from 'uuid'
import { assignHandler } from './transport/handlers/routes'
import { tasksQueue } from './services/tasks-queue'
import path from 'path'
import type { LeeaAgentRegistry } from "./solana/target/types/leea_agent_registry";
import idl from "./solana/target/idl/leea_agent_registry.json";
import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";

export class LeeaAgent {
  private transport: WebSocketClient
  private readonly authStorage = new ValueContainer()
  private readonly apiClient = getApi(this.authStorage)
  private solanaConnection: Connection
  private solanaKey: Keypair
  private name: string
  private fee: BN

  constructor(initData: InitData) {
    const fullPath = path.resolve(process.cwd(), initData.secretPath)
    const secret = require(fullPath)
    if (!secret) {
      throw new Error(`No secret found at ${fullPath}`)
    }
    this.solanaKey = Keypair.fromSecretKey(new Uint8Array(secret))
    this.solanaConnection = new Connection(clusterApiUrl("devnet"), "confirmed");
    this.name = initData.name;
    this.fee = new anchor.BN(initData.fee)
    this.registerAgent();
    this.authStorage.set(initData.apiToken)
    this.transport = new WebSocketClient(initData.apiToken, this.buildHello(initData))
    assignHandler(initData.requestHandler)
  }

  private buildHello(initData: InitData): AgentHello {
    return {
      name: initData.name,
      description: initData.description,
      inputSchema: JSON.stringify(zodToJson(initData.inputSchema), null, 2),
      outputSchema: JSON.stringify(zodToJson(initData.outputSchema), null, 2),
      publicKey: this.solanaKey.publicKey.toBase58(),
      signature: bs58.encode(nacl.sign.detached(decodeUTF8(this.name), this.solanaKey.secretKey)),
    }
  }

  private registerAgent() {
    const connection = this.solanaConnection;
    const program = new Program(idl as LeeaAgentRegistry, {
      connection,
    });
    const confirm = async (signature: string): Promise<string> => {
      const block = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        ...block,
      });
      return signature;
    };

    const log = async (signature: string): Promise<string> => {
      console.log(
        `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
      );
      return signature;
    };
    // Check if already registered
    const [agent] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("leea_agent"), this.solanaKey.publicKey.toBuffer()],
      program.programId
    );
    program.account.agentAccount.fetch(agent)
      .then((agentData) => {
        console.log(`Agent already registered at leea program: ${agentData}`)
        return true;
      })
      .catch((err) => {
        console.log(`Agent not registered at leea program: ${err}, trying to register...`)
        return false;
      }).then((ok) => {
        if (!ok) {
          program.methods
            .registerAgent(this.name, this.fee)
            .accounts({
              holder: this.solanaKey.publicKey
            })
            .signers([this.solanaKey])
            .rpc()
            .then(confirm)
            .then(log)
        }
      })
  }

  async getAgentsList() {
    return await this.apiClient.list()
  }

  async getAgent(fullname: string) {
    return await this.apiClient.get({
      urlParams: {
        fullname,
      },
    })
  }

  callAgent(agentID: string, input: string) {
    const request = ExecutionRequest.create({
      requestID: uuid(),
      agentID,
      input,
    })

    this.transport.sendMessage(request)
    return tasksQueue.add(request.requestID)
  }
}
