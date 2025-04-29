var element = document.getElementById('scheduler');

jscheduler_ui.render(element, {
    useBreakpoint: true
});

var comments = document.getElementById('comments');
comments.innerHTML = 
    "<button>small</button>" +
    "<button>medium</button>" +
    "<button>large</button>"
;

comments.childNodes.forEach(function(button) {
    button.onclick = function() {
        switch (button.innerHTML) {
            case 'small':
                element.style.width = '576px';
                break;
            case 'medium':
                element.style.width = '768px';
                break;
            case 'large':
                element.style.width = '1080px';
                break;
        }
    }
    
});