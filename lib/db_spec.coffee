describe 'db', =>
  expect = (require 'chai').expect
  db = require './db'
  mongoose = require 'mongoose'
  it 'sanity', =>
    (expect db).to.be.ok
    expect db.connection
  
  describe 'open connection', =>
    connection = null
    before (done)=>
      connection = mongoose.connect 'localhost/test', =>
        done()
    
    after =>
      mongoose.connection.close()
      
    it 'should open', (done) =>
      (expect connection).to.be.ok
      done()
      
  describe 'add item', =>
    db = null
    Model = null
    
    before (done)=>
      db = mongoose.connect 'localhost/test', =>
        Model = db.model 'test',
          foo: String
        done()
    
    after (done)=>
      Model.collection.remove =>
        done()
      mongoose.connection.close()
      
    addModel = (done) =>
      model = new Model
        foo: 'bar'
      model.save =>
        done()
      model
      
    it 'add model', (done) =>
      addModel done
        
    describe 'read model', =>
      model = null
      
      beforeEach (done) =>
        model = addModel(done) 
        
      it 'read bar', =>
        (expect model.foo).to.be.equal 'bar'
      
  it 'should'
