class Queue {
    constructor() {
        this.dataStore = Array.prototype.slice.call(arguments, 0)
    }

    enqueue( message ) {
        this.dataStore.push(message)
    }

    dequeue() {
        this.dataStore.shift()
    }

    isEmpty() {
        return this.dataStore == []
    }
}

export default Queue