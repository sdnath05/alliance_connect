import { parse } from 'node-html-parser'
import axios from 'axios';
import FormData from 'form-data';
import dns from 'dns'
import dotenv from 'dotenv'

dotenv.config()

dns.lookupService('8.8.8.8', 53, function (err, hostname, service) {
    console.log(hostname, service);
});

const URL = "http://google.com"

const ValidateIPaddress = (ipaddress) => {
    if (/(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/.test(ipaddress)) {
        return (true)
    }
    return (false)
}
const handlePost = (url = "", body = {}, headers = {}) => {
    headers = {
        ...headers
    }
    return new Promise((resolve, reject) => {
        axios.post(`${url}`, body, {
            headers
        }).then(res => {
            resolve(res)
        }).catch(e => {
            console.log(e)
            reject(e)
        })
    })

}

const handleGet = (endpoint = "", headers = {}) => {
    headers = {
        ...headers
    }
    return new Promise((resolve, reject) => {
        axios.get(`${URL}${endpoint}`, {
            headers
        }).then(res => {
            resolve(res)
        }).catch(e => {
            // console.log(e)
            reject(e)
        })
    })
}


const getIp = () => {
    return new Promise(async (resolve, reject) => {
        const response = await handleGet()
        const html = parse(response.data);
        const aTag = html.querySelectorAll("a")
        // const scriptTag = html.querySelectorAll("script")
        // console.log(aTag[0].getAttribute("href"));

        let flag = ValidateIPaddress(aTag[0].getAttribute("href"))

        if (flag) {
            resolve({ ip: aTag[0].getAttribute("href"), error: false })
        } else {
            resolve({ ip: "", error: true })
        }

    })

}

// getIp()

const connect = async () => {
    try {
        const response = await getIp()
        if (!response.error) {
            console.log("Connecting to...\n" + response.ip)
            let formData = new FormData()

            formData.append('user', process.env.USER_AB);
            formData.append('pass', process.env.PASS_AB);
            formData.append('login', process.env.LOGIN_AB);

            const post = await handlePost(response.ip, formData, {
                "Content-Type": "multipart/form-data"
            })

            // console.log(post.data)
            const html = parse(post.data);
            const trTag = html.querySelectorAll("#thesmalltable tr")
            if(trTag.length > 0){
                console.log("Connection established.");
            }else{
                console.log("Unable to Connect.");
            }

        } else {
            console.log("No IP found Or Server is Down")
        }
    } catch (e) {
        console.log("Error: ", e)
    }

}

connect()