function post(source, on, format)
{
    return event => channel.postMessage({ source, on, event: format(event) })
}

const channel = new BroadcastChannel('app-next-channel')

channel.addEventListener('message', post('message', 'recieve', event =>
{
    return { data: event.data, origin: event.origin }
}))

self.addEventListener('notificationclick', post('notification', 'click', event => 
{ 
    return { action: event.action, id: event.notification.tag }
}))