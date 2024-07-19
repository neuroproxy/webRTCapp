let form = document.getElementById('lobby__form')

//Tomamos el valor de memoria
let displayName = sessionStorage.getItem('display_name')
if (displayName) {
    form.name.value = displayName
}

form.addEventListener('submit', (e) => {
    e.preventDefault()
    //Tomamos el valor de memoria para establecerlo en el campo name del lobby
    sessionStorage.setItem('display_name', e.target.name.value)

    let inviteCode = e.target.room.value

    //Creamos el codigo para la sala
    if (!inviteCode) {
        inviteCode = String(Math.floor(Math.random() * 10000))
    }
    //Redirigimos al inviteCode creado
    window.location = `room.html?room=${inviteCode}`
})