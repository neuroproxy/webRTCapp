const APP_ID = "c534d1fdfefa48238b31354fd4ec6d58"

let uid = sessionStorage.getItem('uid')

if (!uid) {
    uid = String(Math.floor(Math.random()*10000))
    sessionStorage.setItem('uid', uid)
}

let token = null

//Variable que permite el inicio de sesion (cliente) para tener acceso a enviar mensajes (canal)
let client;

//Variables que recuperan desde la url el id que colocamos para crear la sala, Ej: room.html?room=123
let queryString = window.location.search
let urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('room')

if (!roomId) {
    roomId = 'main'
}

let localTracks = []
let remoteUsers = {}

let localScreenTracks;
let sharingScreen = false;

//Funcion que inicia una reunion creando un objeto Cliente que contiene el codec del video, webrtc y los demas parametros para crear una sala
let joinRoomInit = async () => {
    client = AgoraRTC.createClient({mode: 'rtc', codec:'vp8'})
    await client.join(APP_ID, roomId, token, uid)

    client.on('user-published'. handleUserPublished)

    joinStream()
}

//Funcion que toma info del micro y la cam, ademas agg el recuadro de la persona que entra a la sala con la var player
let joinStream = async () => {
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, {encoderConfig:{
        width:{min:640, ideal:1920, max:1920},
        height:{min:480, ideal:1080, max:1080}
    }})

    let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"><div/>
                </div>`

    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
    document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame)

    localTracks[1].play(`user-${uid}`)

    await client.publish([localTracks[0], localTracks[1]])
}


let handleUserPublished = async (user, mediaType) => {
    user = remoteUsers[user.uid]

    await client.subscribe(user, mediaType)

    let player = document.getElementById(`user-container-${user.uid}`)

    if (player === null) {
        player = `<div class="video__container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"><div/>
            </div>`
        document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
        document.getElementById(`user-container-${user.uid}`).addEventListener('click', expandVideoFrame)
    }

    if (displayFrame.style.display) {
        let videoFrame = document.getElementById(`user-container-${user.uid}`)
        videoFrame.style.height = '100px'
        videoFrame.style.width = '100px'
    }

    if (mediaType === 'video') {
        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio') {
        user.audioTrack.play()
    }
}


joinRoomInit()