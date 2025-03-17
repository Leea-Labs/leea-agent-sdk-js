class TasksQueue {
  private queue = new Map<string, Function>()

  add(requestId: string) {
    const promise = new Promise<any>((resolve) => {
      this.queue.set(requestId, resolve)
    })

    return promise
  }

  resolve(requestId: string, result: any) {
    const resolve = this.queue.get(requestId)
    if (resolve) {
      resolve(result)
    }
    this.queue.delete(requestId)
  }
}

export const tasksQueue = new TasksQueue()
