export const DisplayMessage = (message, messageType) => {

    // msg
    const msg = document.createElement("span");
    msg.innerHTML = message;
    msg.className = "MsgText";
    const wrapper = document.createElement("div");
    wrapper.className = "Center Vertically Horizontally";
    wrapper.appendChild(msg);

    // timer
    const timer = document.createElement("div");
    timer.className = "MsgTimer";

    //box
    const box = document.createElement("div");
    box.className = "MsgBox";
    box.style.backgroundColor = messageType


    box.appendChild(wrapper);
    box.appendChild(timer);
    document.body.insertBefore(box, document.body.firstChild);
    setTimeout(() => {

        box.style.marginTop = "7vh";
        setTimeout(() => {
            timer.style.width = "0%";
            setTimeout(() => {
                document.body.removeChild(box);
            }, 3000);
        }, 300);
    }, 100);
}