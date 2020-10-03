const channel = new BroadcastChannel('app-next-channel')

self.addEventListener('notificationclick', event =>
{ 
    channel.postMessage({ source: 'notification', event: 'click', data: event.notification.tag })
})
