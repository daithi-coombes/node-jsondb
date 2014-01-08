
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

		db.setStorage(storage).run()
	})

	afterEach(function(){
		fs.exists(database, function(exists){
			if(exists)
				db.delete('database', dbname)
		})
	})

	
	it('Should create new database', function(done){

		db.connect(dbname, function(){
			
			fs.readFile(database, function(err, data){
				var j = JSON.parse(data)
				assert.equal(j.dbname, dbname)
				done()
			})
		}).run()

	})

	/**
	it('Should connect to created database', function(done){
		
		//create db
		db.connect(dbname, function(){
				console.log('1st connect')
			})
			//create db
			.close(function(){
				console.log('closing connection')
				done()
			}).run()	//reset connection
			/**
			.setStorage(storage, function(){
				console.log('setting storage')
			})
			.connect(dbname, function(){

				console.log('Final callback')
				fs.exists(database, function(exists){
					if(exists)
						done()
				})
			}).run()
	})

	it('Should delete database', function(done){
		
		db.connect(dbname, function(){

			db.setStorage(storage)
			db.delete('database', dbname, function(){

				fs.exists(database, function(exists){
					if(!exists)
						done()
					else
						console.log('exists: '+database)
				})
			})
		})		
	})

	it('Should create and delete table', function(done){

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

					db.delete('table', tblname, function(){
						fs.readFile(database, {encoding:'UTF8'}, function(err, data){

							var j = JSON.parse(data)
							assert.deepEqual(j, {
								    "dbname": "my_database",
								    "tables": {}
								}
							)
							done()
						})
					})
				})
			})
	})

	it('Should add and delete fields', function(done){

		var field = 'foo-field',
			value = 'bar'

		db.connect(dbname)
			.update(tblname, {field: value}, function(){
				console.log(db.getDB())
				done()
			})
	})
	*/
})