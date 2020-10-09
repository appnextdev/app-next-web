function handleError(error)
{
    throw error
}

const tasks = []

setInterval(() =>
{
    const count = tasks.length,
          now = new Date().getTime()

    for (let i = 0; i < count; i++)
    {
        const task = tasks.shift()

        try
        {
            if (now > task.when)
            {
                postMessage(task)
            }
            else
            {
                tasks.push(task)
            }
        }
        catch(error)
        {
            handleError(error)
        }
    }

}, 500)

onmessage = event =>
{
    try
    {
        const task = event.data

        if (!(task.when instanceof Date) || !(task.key))
        {
            const error = new Error('Invalid task object')

            error.name = 'invalid task'; handleError(error)
        }

        task.when.setMilliseconds(0)
        task.when = task.when.getTime()
        tasks.push(task)
    }
    catch(error)
    {
        handleError(error)
    }
}