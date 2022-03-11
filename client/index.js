import config from '../config';
import qs from "query-string";

function getAuthtorizationFromApp(){
    const OAuthQueryParams = {
        client_id: config.CLIENT_ID,
        response_type: 'code',
        scope: 'user public_repo',
        redirect_url: config.REDIRECT_URL,
        state: 'random_state_string',
    }

    const query = qs.stringify(OAuthQueryParams);
    const url = `${config.AUTHORIZATION_ENDPOINT}?${query}`;
    const loginlink = document.querySelector("a")
    loginlink.setAttribute("href", url);
}


function handleCodeComingFromApp(){
    const parsedQuery = qs.parseUrl(window.location.href)

    if(parsedQuery.query.code){
        sendCodeToServer()
    }else{
        throw new Error("No code found in query string")
    }


async function sendCodeToServer(){
    const server = "http://localhost:8788/api/code";
    try {
        const res = await fetch(server, {
            method: "POST",
            body: JSON.stringify({
                code: parsedQuery.query.code,
                state: parsedQuery.query.state,
            }),
            headers: {
                "Content-Type": "application/json",
            }

            
            
        })

        const data = await res.json();
        console.log( "here" + data);
        localStorage.setItem("jwt", data.jwtencoded);
        window.location.href = config.REDIRECT_URL;
        
    } catch (error) {
        console.log(error)
    }
}

}


window.onload = function(){
    getAuthtorizationFromApp();
    handleCodeComingFromApp();
}
