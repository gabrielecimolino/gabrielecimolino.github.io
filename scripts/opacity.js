var opacity = 1;
var heldKeys = [];

var elements = Array.from(document.body.getElementsByTagName("*"));

function update()
{
    if(heldKeys.length > 0) opacity -= 0.01;
    else opacity += 0.01;

    opacity = Math.max(0, Math.min(1, opacity));

    elements.forEach((element) =>
    {
        if(element.id != "boidsCanvas") element.style.opacity = opacity;
    });
}

function isArrowKey(keycode)
{
    return keycode >= 37 && keycode <=40;
}

function handleKeyDown(event){
    if(isArrowKey(event.keyCode) && !heldKeys.includes(event.keyCode)) heldKeys.push(event.keyCode)
}

function handleKeyUp(event){
    if(heldKeys.includes(event.keyCode)) heldKeys = heldKeys.filter((key) => key != event.keyCode);
}

window.setInterval(update,10);
document.addEventListener("keydown", handleKeyDown, false);
document.addEventListener("keyup", handleKeyUp, false);