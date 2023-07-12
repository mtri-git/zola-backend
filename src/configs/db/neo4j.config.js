const neo4j = require('neo4j-driver')
require('dotenv').config()

const uri = process.env.NEO4J_URL
const user = process.env.NEO4J_USER
const password = process.env.NEO4J_PASSWORD

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

let session

const init = () => {
    console.log("Connecting to Neo4j...")
    session = driver.session()
    console.log("Connected to Neo4j")
}

const getSession = () => session

const runQuery = async (query, params) => {
  const session = getSession()
  try {
        const result = await session.run(query, params)
        session.close()
        return result
    } catch (error) {
        session.close()
        throw error
    }
}

const neo4jMiddleware = (req, res, next) => {
    const session = driver.session()
    req.neo4jSession = session
    next()
  }

module.exports = {
    init,
    getSession,
    runQuery
}