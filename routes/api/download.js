module.exports = function(req, res, next, db, log, cRes, jwt,cPlayer) {
    cPlayer.play(req.query["url"]).then((stream) =>{
        res.setHeader('Content-disposition', `attachment; filename=${req.query["url"]}.mp3`);
		res.setHeader('Content-Type', 'application/audio/mpeg3')
        stream.pipe(res);
    }).catch(() =>{
        // res.send();
    });
}