
var fs = require('fs'),
	rewire = require('rewire'),
	database,
	db,
	dbname,
	storage

describe('jsondb: ', function(){

	beforeEach(function(){

		db = require(process.cwd()+'/lib/jsondb')
		dbname = 'my_database'
		storage = './tests'
		database = storage+'/'+dbname+'.json'

		db.setStorage(storage)
	})

	afterEach(function(){
		fs.exists(database, function(){
			db.deleteDB(dbname)
		})
	})

	it('Should create new database', function(done){

		db.connect(dbname, function(){

			//check file exists
			fs.exists(database, function(exists){
				if(exists)
					done()
			})
		})

	})

	it('Should connect to created database', function(done){
		
		//create db
		db.connect(dbname, function(){

			db.close()
				.setStorage(storage)
				.connect(dbname, function(){
					if(db.getDB().handle)
						done()
				})
		})
	})

	it('Should delete database', function(done){
		
		db.connect(dbname, function(){

			db.setStorage(storage)
			db.deleteDB(dbname, function(){

				fs.exists(database, function(exists){
					if(!exists)
						done()
					else
						console.log('exists: '+database)
				})
			})
		})		
	})
})