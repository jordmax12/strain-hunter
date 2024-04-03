const handler = async (event) => {
    console.log('hello world');

    return {
        statusCode: 200
    }
}

module.exports = {
    handler
}