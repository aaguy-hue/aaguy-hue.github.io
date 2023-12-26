const ROOT_URL = "https://aaguy-hue.github.io"
const PROJECT_LIST_SECTION = document.querySelector(".project-list");

function makeHttpObject() {
    try {return new XMLHttpRequest();}
    catch (error) {}
    try {return new ActiveXObject("Msxml2.XMLHTTP");}
    catch (error) {}
    try {return new ActiveXObject("Microsoft.XMLHTTP");}
    catch (error) {}
  
    throw new Error("Could not create HTTP request object.");
}

function sendGet(url, callback) {
    var request = makeHttpObject();
    request.open("GET", url, true);
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200)
            callback(request.responseText);
    };
    request.send(null);
}

function getProjects(callback) {
    sendGet(ROOT_URL + "/data/projects", function(response) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response, 'text/html');
        const rows = doc.querySelectorAll("tbody tr");

        let links = [];
        for (let i = 0; i < rows.length; i++) {
            let projLink = ROOT_URL + "/data/projects/" + rows[i].querySelector("a").getAttribute("href");
            if (!projLink.includes("schema")) { links.push(projLink); };
        };
        

        let projectData = [];

        // Function to handle individual project data fetching
        function fetchProjectData(index) {
            if (index >= links.length) {
                // All data fetched, invoke the callback
                callback(projectData);
                return;
            }

            sendGet(links[index], function(projData) {
                let huh = JSON.parse(projData);
                huh.projectPage = links[index];
                projectData.push(huh);
                fetchProjectData(index + 1); // Move to the next project
            });
        }

        // Start fetching project data from the first link
        fetchProjectData(0);
    });
}

function reloadProjects() {
    getProjects(function (projects) {
        PROJECT_LIST_SECTION.innerHTML = "";
        
        // sort from greatest coolness to least
        projects.sort(function (a,b) { return b.coolness - a.coolness; });
        
        for (let i = 0; i < projects.length; i++) {
            let articleElement = document.createElement('article');
            articleElement.classList.add('project-listing', 'listing');

            let linkElement = document.createElement('a');
            linkElement.classList.add('project-name');
            linkElement.textContent = projects[i].projectName;
            linkElement.setAttribute('href', projects[i].projectPage);

            articleElement.appendChild(linkElement);
            PROJECT_LIST_SECTION.appendChild(articleElement);
        };
    });
}

reloadProjects();
