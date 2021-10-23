const video = document.querySelector("video")

const videoPlaybackRates = [0.5, 0.75, 1, 1.5, 2]

const msgContainerDiv = document.querySelector(".message")
const msgINode = msgContainerDiv.querySelector("i")

const volumeInput = document.querySelector("#volume")
const fullscreenNode = document.querySelector(".fullscreen-action")
const volumeIcon = document.querySelector("#volume-icon")

const fullProgressBar = document.querySelector(".progress-bar-full")
const progressBar = document.querySelector(".progress-bar")

const timeContainer = document.querySelector(".time")

const speedContainer = document.querySelector(".speed-container")
const speedPicker = speedContainer.querySelector(".speed-picker")
const speedOptions = speedPicker.querySelectorAll(".speed-option")
const speedSpan = document.querySelector(".current-speed")

let msgTimeout = false
let isVideoLoaded = false

const flashMessage = (msg, isIcon = false) => {
    if(!isVideoLoaded) return
    if (msgTimeout) clearTimeout(msgTimeout)
    msgContainerDiv.classList.add("show")
    if (isIcon) {
        msgINode.innerText = ""
        msgINode.className = "fa fa-" + msg
    } else {
        msgINode.innerText = msg
        msgINode.className = ""
    }
    msgTimeout = setTimeout(() => msgContainerDiv.classList.remove("show"), 100)
}

const togglePlay = () => video.paused ? (video.play(), flashMessage("play", true)) : (video.pause(), flashMessage("pause", true))

const skip = seconds => video.currentTime += seconds
const updateVolume = volume => {
    if (video.muted) toggleMute()
    video.volume = volume
    flashMessage(Math.round(volume * 100) + "%")
    volumeInput.value = volume
    if (volume < .1) volumeIcon.className = "fa fa-volume-off"
    else if (volume < .5) volumeIcon.className = "fa fa-volume-down"
    else volumeIcon.className = "fa fa-volume-up"
    localStorage.setItem("volume", volume)
}

const updateSpeed = speed => {
    video.playbackRate = speed
    speedSpan.innerText = speed.toFixed(2) + "x"
    flashMessage(speed.toFixed(2) + "x")
    localStorage.setItem("playbackSpeed", speed)
}

const toggleFullscreen = () => document.fullscreenElement ? document.exitFullscreen() : video.parentNode.requestFullscreen()

const toggleMute = () => {
    video.muted = !video.muted
    localStorage.setItem("muted", video.muted)
    if (video.muted) {
        volumeIcon.className = "fa fa-volume-mute"
        flashMessage("volume-mute", true)
        volumeInput.value = 0
    } else {
        if (video.volume < .1) volumeIcon.className = "fa fa-volume-off"
        else if (video.volume < .5) volumeIcon.className = "fa fa-volume-down"
        else volumeIcon.className = "fa fa-volume-up"
        flashMessage("volume-up", true)
        volumeInput.value = video.volume
    }
}

const changeSpeed = increace => {
    let rateIndex = videoPlaybackRates.indexOf(video.playbackRate) + (increace ? 1 : -1)
    rateIndex = Math.min(Math.max(rateIndex, 0), videoPlaybackRates.length - 1)
    const playbackRate = videoPlaybackRates[rateIndex]
    updateSpeed(playbackRate)
}

const incrementVolume = increace => {
    const modifier = .05
    const videoVolume = video.volume
    const change = (increace ? modifier : -modifier)
    const newVolume = Math.min(Math.max(videoVolume + change, 0), 1)
    updateVolume(newVolume)
}

const handleTimeUpdate = () => {
    const pbw = (video.currentTime / video.duration) * 100 + "%"
    fullProgressBar.style.width = pbw
    const currTimeFormatted = new Date(1000 * video.currentTime).toISOString().substr(14, 5)
    const lengthFormatter = new Date(1000 * video.duration).toISOString().substr(14, 5)
    timeContainer.innerText = currTimeFormatted + " / " + lengthFormatter
}

const seek = e => {
    let seekedTime = (e.offsetX / progressBar.offsetWidth) * video.duration
    video.currentTime = seekedTime
}

const toggleSpeedOptions = () => speedPicker.classList.toggle("show-speed-options")

const handleOptionSelect = el => {
    const newPBRate = videoPlaybackRates[parseInt(el.getAttribute("data-option"))]
    updateSpeed(newPBRate)
}

const keyboardEventHandlers = e => {
    if([32, 37, 38, 39, 40, 70, 75, 77].includes(e.keyCode)) e.preventDefault()
    if (e.keyCode === 32 || e.keyCode === 75) {
        togglePlay()
    }
    if (e.keyCode === 38) {
        incrementVolume(true)
    }
    if (e.keyCode === 40) {
        incrementVolume(false)
    }
    if (e.keyCode === 39) {
        changeSpeed(true)
    }
    if (e.keyCode === 37) {
        changeSpeed(false)
    }
    if (e.keyCode === 77) {
        toggleMute()
    }
    if (e.keyCode === 70) {
        toggleFullscreen()
    }
}

video.addEventListener("click", togglePlay)
video.addEventListener("dblclick", toggleFullscreen)
video.addEventListener("timeupdate", handleTimeUpdate)

volumeInput.addEventListener("input", e => updateVolume(e.target.value))

fullscreenNode.addEventListener("click", toggleFullscreen)

progressBar.addEventListener("click", seek)

speedContainer.addEventListener("click", toggleSpeedOptions)

speedOptions.forEach(option => option.addEventListener("click", () => handleOptionSelect(option)))

volumeIcon.addEventListener("click", toggleMute)

window.addEventListener("keydown", keyboardEventHandlers)

// init

video.addEventListener("loadedmetadata", () => {
    const volume = parseFloat(localStorage.getItem("volume"))
    const playbackRate = parseFloat(localStorage.getItem("playbackSpeed"))
    const muted = JSON.parse(localStorage.getItem("muted"))

    if(playbackRate) updateSpeed(playbackRate)
    if(volume) updateVolume(volume)
    if(video.muted !== muted) toggleMute()
    handleTimeUpdate()
    isVideoLoaded = true
})
