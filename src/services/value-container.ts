export class ValueContainer<T> {
  private value?: T

  set(value: T) {
    this.value = value
  }

  get() {
    return this.value
  }
}
