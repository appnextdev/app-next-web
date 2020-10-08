function post(source, on, format)
{
    return event => 
    {
        self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients =>
        {
            clients.forEach(client => client.postMessage({ source, on, event: format(event) }))

        }).catch(console.warn)
    }
}

self.addEventListener('notificationclick', post('notification', 'click', event => 
{ 
    return { action: event.action, id: event.notification.tag }
}))

self.addEventListener('notificationclose', post('notification', 'close', event => 
{ 
    return { action: event.action, id: event.notification.tag }
}))