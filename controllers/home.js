const {sample} = require('lodash');
const Contest = require('../models/Contest');

/*
 * GET /
 * Home page.
 */
module.exports.index = async (req, res) => {
	const contests = await Contest.find().sort({_id: -1}).exec();

	res.render('home', {
		title: 'Home',
		contests,
		helloworld: sample([
			'"Hello, World!', // abe
			'iiisa-<*>P/>is+iP>PPm-iiiPi<O/<m/>+<O+d<+<O+><kkkOP->siskkkOP</>P', // 3var
			'"!dlroW ,olleH"d&O`@', // Alice
			'64+"!dlroW ,olleH">:#,_@', // Befunge-93
			'--<-<<+[+[<+>--->->->-<<<]>]<<--.<++++++.<<-..<<.<+.>>.>>.<<<.+++.>>.>>-.<<<+.', // Brainfuck
			'%"Hello, World!";x', // Cardinal
			'"Hello, World!" print', // Cy
			'.-$"Hello, World!"', // Asciidots
			'💬Hello, World!💬➡', // Emoji
			'🏁 🍇 😀 🔤Hello, World!🔤 🍉', // Emojicode
			'aeeeaeeewueuueweeueeuewwaaaweaaewaeaawueweeeaeeewaaawueeueweeaweeeueuw', // Evil
			'"!dlroW ,olleH"l?!;oe0.', // <><
			'{M[m(_o)O!"Hello, World!\\n"(_o)o.?]}', // Grass
			'h', // Goruby
			'<HTMS id="htms"><q>Hello, World!</q></HTMS>', // HTMS
			'H;e;l;d;*;r;o;Wl;;o;*433;@.>;23<\\4;*/', // Hexagony
			'72.101.108:..111.44.32.87.111.114.108.100.33.@', // Labyrinth
			'「Hello, World!」と表示。', // なでしこ
			'/ World! World!/Hello,/ World! World! World!', // Slashes
			'("Hello, World!"sP', // Snowman
			'["Hello, World!"] | stdout', // Streem
			'HHHeeelll lllooo   wwwooorrrlllddd!!!', // Trigger
			'(Hello, world!)S', // Underload
			'`r```````````.H.e.l.l.o. .W.o.r.l.di', // Unlambda
			'h#10 h$! h$d h$l h$r h$o h$W h#32 h$, h$o h$l h$l h$e h$H >o o$ p jno', // xEec
			'"Hello, World!"', // Generic
			'Hello, World!', // Generic
		]),
	});
};
