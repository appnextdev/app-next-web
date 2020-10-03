function clone(object) 
{
    if (object === null || !(object instanceof Object) || object instanceof Function) return object
    
    const copy = Array.isArray(object) ? [] : object instanceof Date ? object.toISOString() : {}

    for (let key in object) 
    {
        copy[key] = clone(object[key])
    }
    
    return copy
}

function element(id)
{
    return wait(100, () => document.getElementById(id))
}

function error()
{
    const error = new Error('Test error listener')

    error.name = 'test'; return error
}

function notify(id, ok)
{
    update(id, ok ? 'ok' : 'ko')
}

function output(id, data, append)
{
    const error = data instanceof Error

    error ? console.error(data) : console.info(data)

    const json = JSON.parse(JSON.stringify(clone(error ? { name: data.name, message: data.message } : data)))

    update(id, 'show'); element(id).then(element => 
    {
        const output = prettyPrintJson.toHtml(json) + '<br/>'

        element.innerHTML = append ? element.innerHTML + output : output
    })
}

function update(id, classes)
{
    element(id).then(element =>
    {
        element.classList.add(classes)
    })
}

function wait(interval, criteria)
{
    return new Promise(resolve =>
    {
        const id = setInterval(() => 
        {
            const result = criteria()

            if (result) 
            {
                clearInterval(id)
                
                resolve(result)
            }

        }, interval)
    })
}