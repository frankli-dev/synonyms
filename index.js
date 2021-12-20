const fs = require('fs')
const readline = require('readline')

const rl = readline.createInterface({
  input: fs.createReadStream('test.in'),
  crlfDelay: Infinity
})

fs.truncate('test.out', 0, function () { })
const output = fs.createWriteStream('test.out', {
  flags: 'a' // 'a' means appending (old data will be preserved)
})

class DisjointSetNode {
  constructor(value) {
    this.value = value
    this.children = {}
    this.rank = 1
    this.parent = -1
  }
}


class DisjointSet {
  constructor() {
    this.list = {}
    this.size = 0
  }

  init(size) {
    this.size = size;
    for (let i = 0; i < this.size; i++) {
      let disjointSetNode = new DisjointSetNode(i)
      this.list[i] = disjointSetNode
    }
  }

  findRoot(x) {
    if (this.list[x] && this.list[x].parent !== -1) {
      return this.findRoot(this.list[x].parent)
    } else {
      return this.list[x]
    }
  }

  union(x, y) {
    let xRoot = this.findRoot(x)
    let yRoot = this.findRoot(y)

    if (xRoot === yRoot) return

    yRoot.parent = -1
    yRoot.children[xRoot.value] = xRoot
    xRoot.parent = yRoot.value
  }

  isConnected(value1, value2) {
    if (this.findRoot(value1).value == this.findRoot(value2).value)
      return true
    return false
  }
}

let T = -1
let action = 'read_N'
let N = -1
let Q = -1
let words = 0
let wordToIndex = {}
let tempConnections = []
let disjointSet = new DisjointSet()

function init() {
  words = 0
  wordToIndex = {}
  tempConnections = []
  disjointSet = new DisjointSet()
}

function addWordToDic(WORD) {
  const word = WORD.toLowerCase()
  if (wordToIndex[word] === undefined) {
    wordToIndex[word] = words
    words++
    return words - 1;
  }
  return wordToIndex[word]
}

function getIndexOfWord(WORD) {
  return wordToIndex[WORD.toLowerCase()]
}

function initDisjointSet() {
  disjointSet.init(words)
  tempConnections.map(([first, second]) => {
    disjointSet.union(first, second)
  })
}

function isSynonym(left, right) {
  if (left.toLowerCase() === right.toLowerCase()) return true
  const leftIndex = getIndexOfWord(left)
  const rightIndex = getIndexOfWord(right)
  if (leftIndex === undefined || rightIndex === undefined) return false
  return disjointSet.isConnected(leftIndex, rightIndex)
}

rl.on('line', (line) => {
  if (T === -1) {
    T = parseInt(line)
    return
  }

  switch (action) {
    case 'read_N':
      N = parseInt(line)
      action = 'read_dictionary'
      init()
      break
    case 'read_dictionary':
      let [first, second] = line.split(' ')
      const firstIndex = addWordToDic(first)
      const secondIndex = addWordToDic(second)
      tempConnections.push([firstIndex, secondIndex])
      N = N - 1
      if (N === 0) {
        action = 'read_Q'
      }
      break
    case 'read_Q':
      Q = parseInt(line)
      action = 'read_query'
      initDisjointSet()
      break
    case 'read_query':
      let [left, right] = line.split(' ')
      if (isSynonym(left, right)) {
        output.write('synonyms\n')
      } else {
        output.write('different\n')
      }
      Q = Q - 1
      if (Q === 0) {
        action = 'read_N'
      }
      break
  }
});