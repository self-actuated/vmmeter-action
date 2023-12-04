all:
	ncc build -o dist/main index.js --license licenses.txt
	ncc build -o dist/post post.js --license licenses.txt
