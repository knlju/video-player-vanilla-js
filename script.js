const video = document.querySelector("video")
const videoContainer = document.querySelector(".video-container")
const videoControls = document.querySelector(".controls")
const videoTitle = document.querySelector(".video-title")
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
const playIcon = document.querySelector("#toggle-play-icon")

const videoPlaybackRates = [0.5, 0.75, 1, 1.5, 2]
let msgTimeout = false
let isVideoLoaded = false

const flashMessage = (msg, isIcon = false) => {
    if (!isVideoLoaded) return
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

const togglePlay = () => {
    if (pbActionInProgress) return
    if (video.paused) {
        video.play()
        flashMessage("play", true)
        playIcon.className = "fa fa-pause"
        setTimeout(hideVideoOptions, 500)
    } else {
        video.pause()
        flashMessage("pause", true)
        playIcon.className = "fa fa-play"
        setOptionsTimeout()
    }
}

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

const toggleFullscreen = () => document.fullscreenElement ? document.exitFullscreen() : videoContainer.requestFullscreen()

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

const updateProgressbar = percentageWidth => fullProgressBar.style.width = `${percentageWidth}%`

const handleTimeUpdate = () => {
    if (pbActionInProgress) return
    updateProgressbar(video.currentTime / video.duration * 100)
    const currTimeFormatted = new Date(1000 * video.currentTime).toISOString().substr(14, 5)
    const lengthFormatted = new Date(1000 * video.duration).toISOString().substr(14, 5)
    timeContainer.innerText = currTimeFormatted + " / " + lengthFormatted
}

let isPausedAlready = true

const seekEnd = offsetX => {
    const offsetXBound = Math.min(Math.max(offsetX, 0), progressBar.getBoundingClientRect().width)
    let seekedTime = (offsetXBound / progressBar.offsetWidth) * video.duration
    video.currentTime = seekedTime
    !isPausedAlready && video.play()
}

const seek = offsetX => {
    const offsetXBound = Math.min(Math.max(offsetX, 0), progressBar.getBoundingClientRect().width)
    let progresbarWidth = (offsetXBound / progressBar.offsetWidth) * 100;
    !video.paused && video.pause()
    updateProgressbar(progresbarWidth)
}

const calculateOffsetAndSeek = (e, seekFunc) => {
    const videoOffsetX = progressBar.getBoundingClientRect().x
    // desktop or mobile
    let clickedOffsetX
    if (e.clientX) {
        clickedOffsetX = e.clientX
    } else if (e.targetTouches) {
        const lastTouch = e.changedTouches[e.changedTouches.length - 1]
        clickedOffsetX = lastTouch.clientX
    } else clickedOffsetX = 0
    const offsetX = clickedOffsetX - videoOffsetX
    seekFunc(offsetX)
}

let pbActionInProgress = false

const handleProgressBarActionStart = e => {
    e.type.indexOf("mouse") !== -1 && e.preventDefault()
    isPausedAlready = video.paused
    pbActionInProgress = true
    calculateOffsetAndSeek(e, seek)
}

const handleProgressBarActionProgress = e => {
    // prevent touch handler
    e.type.indexOf("mouse") !== -1 && e.preventDefault()
    setOptionsTimeout()
    calculateOffsetAndSeek(e, seek)
}

const handleProgressBarActionEnd = e => {
    e.type.indexOf("mouse") !== -1 && e.preventDefault()
    pbActionInProgress = false
    calculateOffsetAndSeek(e, seekEnd)
}

const toggleSpeedOptions = () => speedPicker.classList.toggle("show-speed-options")

const handleOptionSelect = el => {
    const newPBRate = videoPlaybackRates[parseInt(el.getAttribute("data-option"))]
    updateSpeed(newPBRate)
}

let optionsTimeout = false

const hideVideoOptions = () => {
    videoControls.classList.remove("show-controls")
    videoTitle.classList.remove("show-title")
    speedPicker.classList.remove("show-speed-options")
}

const showOptions = e => {
    videoControls.classList.add("show-controls")
    videoTitle.classList.add("show-title")
}

const setOptionsTimeout = () => {
    showOptions()
    if (optionsTimeout) clearTimeout(optionsTimeout)
    optionsTimeout = setTimeout(hideVideoOptions, 3000)
}

const handleMouseOverVC = e => setOptionsTimeout()
const handleMouseLeaveVC = e => hideVideoOptions()

const keyboardEventHandlers = e => {
    const usedKeys = [32, 37, 38, 39, 40, 70, 75, 77]
    if (usedKeys.includes(e.keyCode)) e.preventDefault()
    if (e.keyCode === 32 || e.keyCode === 75) togglePlay()
    if (e.keyCode === 38) incrementVolume(true)
    if (e.keyCode === 40) incrementVolume(false)
    if (e.keyCode === 39) changeSpeed(true)
    if (e.keyCode === 37) changeSpeed(false)
    if (e.keyCode === 77) toggleMute()
    if (e.keyCode === 70) toggleFullscreen()
}

const init = () => {
    const volume = parseFloat(localStorage.getItem("volume"))
    const playbackRate = parseFloat(localStorage.getItem("playbackSpeed"))
    const muted = JSON.parse(localStorage.getItem("muted"))

    // predlog: dodaj video playback rate iz js-a da bi bilo custom 
    if (playbackRate) updateSpeed(playbackRate)
    if (volume) updateVolume(volume)
    if (muted && (video.muted !== muted)) toggleMute()
    handleTimeUpdate()

    isVideoLoaded = true
}

video.addEventListener("click", e => togglePlay(e))
video.addEventListener("dblclick", toggleFullscreen)
video.addEventListener("timeupdate", handleTimeUpdate)
video.addEventListener("touchstart", setOptionsTimeout)
volumeInput.addEventListener("input", e => updateVolume(e.target.value))
fullscreenNode.addEventListener("click", toggleFullscreen)
progressBar.addEventListener("mousedown", handleProgressBarActionStart)
document.addEventListener("mousemove", e => pbActionInProgress && handleProgressBarActionProgress(e))
document.addEventListener("mouseup", e => pbActionInProgress && handleProgressBarActionEnd(e))
progressBar.addEventListener("touchstart", handleProgressBarActionStart)
document.addEventListener("touchmove", e => pbActionInProgress && handleProgressBarActionProgress(e))
document.addEventListener("touchend", e => pbActionInProgress && handleProgressBarActionEnd(e))
document.addEventListener("touchcancel", e => pbActionInProgress && handleProgressBarActionEnd(e))
speedContainer.addEventListener("click", toggleSpeedOptions)
speedOptions.forEach(option => option.addEventListener("click", () => handleOptionSelect(option)))
volumeIcon.addEventListener("click", toggleMute)
window.addEventListener("keydown", keyboardEventHandlers)
videoContainer.addEventListener("mousemove", handleMouseOverVC)
videoContainer.addEventListener("mouseleave", handleMouseLeaveVC)
playIcon.addEventListener("click", togglePlay)

// init saved settings
video.addEventListener("loadedmetadata", init)
// workaround loadedmetadata race condition
if (video.readyState >= 2) init()
