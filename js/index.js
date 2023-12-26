const ROOT_URL = "https://aaguy-hue.github.io"

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
            let projLink = rows[i].querySelector("a").href;
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
                projectData.push(JSON.parse(projData));
                fetchProjectData(index + 1); // Move to the next project
            });
        }

        // Start fetching project data from the first link
        fetchProjectData(0);
    });
}

function reloadProjects() {
    getProjects(function (projects) {
        projects.sort(function (a,b) { return a.coolness - b.coolness; });
        console.log(projects);
    });
}
