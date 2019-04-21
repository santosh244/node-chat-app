const socket =io()

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username, room}  = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild;
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageheight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if( containerHeight - newMessageheight <= scrollOffset ) {
     $messages.scrollTop =  $messages.scrollHeight
    }
}

socket.on('message', (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate , {
        username: msg.username,
        msg: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => { 
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username:message.username,
        url: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

} )

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

 $messageForm.addEventListener('submit', (e) => {
     e.preventDefault()
     $messageFormButton.setAttribute('disabled', 'disabled');
     const message = e.target.elements.message.value

     socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.focus()
         if(error) {
         console.log(error)
         } else {
             console.log('Message Delivered Successfully')
             e.target.elements.message.value = '';
         }
     })
 })

 $sendLocationButton.addEventListener('click', () => {
     $sendLocationButton.setAttribute('disabled', 'disabled');
     if(!navigator.geolocation){
         return alert('Geolocations is not supported by your browser')
     }

     navigator.geolocation.getCurrentPosition((position) => {
      const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
      }

      socket.emit('sendLocation', location,(reply) => {
          $sendLocationButton.removeAttribute('disabled')
         console.log(reply)
      })
     })
 })


 socket.emit('join', {username, room},(error) => {
     if(error) {
         alert(error)
         location.href = '/'
     }
 })
