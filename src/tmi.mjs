import { Client } from 'tmi.js';

export default function connectTMI(channel) {

	return new Promise ((resolve, reject) => {
		const client = new Client({
			channels: [ channel ]
		});
	
		client.connect().then(() => {
			console.log('connected')
			resolve(client)
		}).catch((err) => {
			reject(err)
		});
	})


	

}