// Launch esolang-battle with worker mode.
// This will be combined with polyglot-battle.

const {Mutex} = require('async-mutex');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const firebase = require('firebase-admin');
const {v4: uuid} = require('uuid');
const docker = require('./engines/docker.js');

dotenvExpand(dotenv.config({path: '.env'}));

const mutex = new Mutex();

firebase.initializeApp({
	credential: firebase.credential.applicationDefault(),
	databaseURL: 'https://hakatashi.firebaseio.com',
});
const db = firebase.firestore();
const submissionsRef = db.collection('polyglot-battle-submissions');

const dequeue = async () => {
	const submissionDoc = await db.runTransaction(async (transaction) => {
		const query = submissionsRef
			.where('status', '==', 'pending')
			.orderBy('createdAt')
			.limit(1);
		const snapshot = await transaction.get(query);

		if (snapshot.size <= 0) {
			return null;
		}
		// eslint-disable-next-line prefer-destructuring
		const doc = snapshot.docs[0];
		await transaction.update(doc.ref, {
			status: 'running',
		});

		return doc;
	});

	if (submissionDoc === null) {
		return;
	}

	const submission = submissionDoc.data();
	console.log(`Processing ${submissionDoc.id}...`);
	console.log(
		`date: ${new Date(submission.createdAt._seconds * 1000).toString()}`,
	);
	console.log(`lang: ${submission.lang}`);
	console.log(`code: ${submission.code.slice(0, 50).replace(/\n/g, ' ')}...`);

	const result = await docker({
		id: submission.lang,
		code: Buffer.from(submission.code),
		stdin: submission.stdin,
		trace: false,
		disasm: false,
	});

	await submissionDoc.ref.update({
		stdout: result.stdout.toString(),
		stderr: result.stderr.toString(),
		duration: result.duration,
		error: result.error ? result.error.toString() : null,
		status: 'completed',
	});
};

(async () => {
	const docs = await submissionsRef.listDocuments();
	const batch = db.batch();
	for (const doc of docs) {
		batch.update(doc, {status: 'pending'});
	}
	await batch.commit();
	submissionsRef.onSnapshot(() => {
		mutex.runExclusive(dequeue);
	});
})();
