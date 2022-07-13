user_id = "oliverbravery";
playlist_url = "https://api.spotify.com/v1/users/"+user_id+"/playlists";
TrackNumAndURI = [];

function getCookie(name) { 
    const value = `${document.cookie}`;
    var cookieContent = "";
    var array = value.split(";");
    array.forEach(element => {
        var temp = element.split("=");
        var cookieName = temp[0];
        if(cookieName == name) {
            cookieContent = temp[1].toString();
        }
    });
    return cookieContent;
}

function apiGetAccessToken(data) {
    var xmlHttp = new XMLHttpRequest();
    var temp = getCookie("ThePasswordString");
    xmlHttp.open( "GET", `https://www.bangers.online/GetAccessToken?cookie=${temp}`, false)
    xmlHttp.withCredentials = true;
    xmlHttp.send(data);
    var res = xmlHttp.responseText;
    if(res == "-1") {
        window.location.href = "index.html";
    }
    else {
        return xmlHttp.responseText;
    }
}

function httpGet(theUrl, data)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); 
    xmlHttp.setRequestHeader("Authorization", apiGetAccessToken());
    xmlHttp.send( data );
    return xmlHttp.responseText;
}

function httpGetLogin(theUrl, data)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); 
    // xmlHttp.setRequestHeader("Authorization", "HelloWorld");
    xmlHttp.withCredentials = true;
    xmlHttp.send( data );
    var res = xmlHttp.responseText;
    if(res != "-1") {
        console.log("Logged in");
        document.cookie = res;
        window.location.href = "songListPage.html";
    }
}

function httpDelete(theUrl, data)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "DELETE", theUrl, false ); 
    xmlHttp.setRequestHeader("Authorization", apiGetAccessToken());
    xmlHttp.send( data );
    return xmlHttp.responseText;
}

function RemoveItemFromPlaylist(pl_url, uri) {
    queryString = pl_url
    x = httpDelete(queryString, JSON.stringify({"tracks":[{"uri":uri}]}) );
}

function PrintTracks(pl_url,size) {
    listOfTracksAndURI = [];
    trackNumber = 0;
    tempOffset = -100;
    tempLimit = 100;
    while(tempOffset < size) {
        tempOffset += 100;
        queryString = `${pl_url}?offset=${tempOffset}&limit=${tempLimit}`;
        playlist = JSON.parse(httpGet(queryString));
        playlist["items"].forEach(item => {
            imageUrl = item["track"]["album"]["images"][0]["url"];
            var listI = document.createElement("li");
            listI.classList = "songItem";
            listI.id = `tn${trackNumber + 1}`;
            document.getElementById('SongList').appendChild(listI);
            var divY = document.createElement("div");
            listI.appendChild(divY);
            var img = document.createElement('img');
            img.classList = "albumArt";
            img.src = imageUrl;
            divY.appendChild(img);
            var songTitle = document.createElement("p");
            songTitle.classList = "songTitle";
            songTitle.textContent = `${trackNumber + 1} - ${item['track']['name']}`;
            divY.appendChild(songTitle);
            var deleteButton = document.createElement("button");
            deleteButton.classList = "deleteButton";
            deleteButton.textContent = "Delete";
            deleteButton.type = "button";
            deleteButton.onclick = function() {
                let isExecuted = confirm("Are you sure you want to delete this track?");
                if(isExecuted) {
                    RemoveItemFromPlaylist(pl_url, item["track"]["uri"]);
                    this.closest(".songItem").remove();
                }
            }
            divY.appendChild(deleteButton);
            listOfTracksAndURI.push([trackNumber, item["track"]["uri"]]);
            trackNumber++;
        });
    }
    return listOfTracksAndURI;
}

function DisplayPlaylistTracks(playlistName) {
    playlists = JSON.parse(httpGet(playlist_url));
    playlists["items"].forEach(playlist => {
        if(playlist["name"] == playlistName) {
            sizeOfPlaylist = playlist["tracks"]["total"];
            b = playlist["tracks"]["href"];
            TrackNumAndURI = PrintTracks(b, sizeOfPlaylist);
            return TrackNumAndURI;
        }
    });
}

function SearchByTrackNumber() { //Obsolete function
    var trackNumber = document.getElementById("trackNumberInput").value;
    var trackListItem = document.getElementById(`tn${trackNumber}`);
    if(trackListItem == null) {
        alert("Track number not found");
    }
    else {
        trackListItem.scrollIntoView({behavior: "smooth", block: "center"});
    }
    console.log(trackNumber);
    console.log(trackListItem);
}

function SearchByTitle() {
    var songTitleInput = document.getElementById("trackNumberInput").value.toUpperCase();
    var trackSongItem = document.getElementsByClassName("songTitle");
    var located = false;
    if(songTitleInput == "") { 
        alert("No songs found matching that query.");
    }
    else {
        for(var i = 0; i < trackSongItem.length; i++) {
            var tempTitle = trackSongItem[trackSongItem.length - 1 - i].textContent.toUpperCase();
            console.log(tempTitle);
            if(tempTitle.includes(songTitleInput)) { 
                trackSongItem[trackSongItem.length - 1 - i].scrollIntoView({behavior: "smooth", block: "center"});
                located = true;
            }
        }
    }
    if(!located) {
        alert("No songs found matching that query.");
    }
}

function LoginFunc() {
    UIPassword = document.getElementById("passwordField").value;
    d = new Date();
    var hashedPasswordB = sjcl.hash.sha256.hash(UIPassword);
    var hashedPassword = sjcl.codec.hex.fromBits(hashedPasswordB);  
    hashedPasswordB = sjcl.hash.sha256.hash(hashedPassword + d.getMinutes());
    var hashedPassword = sjcl.codec.hex.fromBits(hashedPasswordB);  
    httpGetLogin(`https://www.bangers.online/Login?password=${hashedPassword}`);
}