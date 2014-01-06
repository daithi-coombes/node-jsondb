
var assert = require('assert'),
	fs = require('fs'),
	rewire = require('rewire'),
	database,
	db,
	dbname,
	storage,
	tblname

describe('jsondb: ', function(){

	beforeEach(function(){

		db = require(process.cwd()+'/lib/jsondb')
		dbname = 'my_database'
		storage = './tests'
		tblname = 'foo_table'
		database = storage+'/'+dbname+'.json'

		db.setStorage(storage)
	})

	afterEach(function(){
		fs.exists(database, function(exists){
			if(exists)
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
					fs.exists(database, function(exists){
						if(exists)
							done()
					})
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

	it('Should create table', function(done){

		db.connect(dbname)
			.create(tblname, function(){
				
				fs.readFile(database, {encoding:'UTF8'}, function(err, data){

					var j = JSON.parse(data)
					assert.deepEqual(j, {
						    "dbname": "my_database",
						    "tables": {
						        "foo_table": []
						    }
						}
					)
					done()
				})
			})
	})
})