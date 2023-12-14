var englishButton = document.getElementById("englishButton");
var simplifiedButton = document.getElementById("simplifiedButton");
var traditionalButton = document.getElementById("traditionalButton");

var buttons = [englishButton, simplifiedButton, traditionalButton];

englishButton.addEventListener('click', () => selectLanguage("en"));
simplifiedButton.addEventListener('click', () => selectLanguage("zh-cn"));
traditionalButton.addEventListener('click', () => selectLanguage("zh-tw"));

textElements = {}
textElements[englishButton.textContent] = Array.from(document.getElementsByClassName("en"));
textElements[simplifiedButton.textContent] = Array.from(document.getElementsByClassName("zh-cn"));
textElements[traditionalButton.textContent] = Array.from(document.getElementsByClassName("zh-tw"));

var languageSetting = localStorage.getItem('language');
if(languageSetting == null) languageSetting = "en"

selectLanguage(languageSetting);

function selectLanguage(language)
{
    button = null;

    if(language == "en") button = englishButton;
    if(language == "zh-cn") button = simplifiedButton;
    if(language == "zh-tw") button = traditionalButton;

    localStorage.setItem('language', language)

    buttons.forEach((e) => 
    {
        if(e.classList.contains("selected")) 
        {
            e.classList.remove("selected"); 
        }

        textElements[e.textContent].forEach((text) => text.style.display = "none");

        if(e == button) 
        {
            e.classList.add("selected");

            textElements[e.textContent].forEach((text) => text.style.display = "flex")
        }
    });
}