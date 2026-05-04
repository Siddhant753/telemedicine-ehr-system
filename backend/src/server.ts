import 'dotenv/config'
import app from './app'
import dbConnect from './config/dbConnect'

const PORT = process.env.PORT || 5000

async function startServer() {
    await dbConnect()

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
}

startServer();