onmessage = event => 
{
    try
    {
        const message = event.data

        postMessage(message)
    }
    catch(error)
    {
        postMessage({ error })
    }
}