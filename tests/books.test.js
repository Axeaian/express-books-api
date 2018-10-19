const express = require("express");
const request = require("supertest");

const MongodbMemoryServer = require("mongodb-memory-server").default;
const mongod = new MongodbMemoryServer();
const mongoose = require("mongoose");
const Book = require("../models/book");
const Author = require("../models/author");

const app = require("../app");

beforeAll(async () => {
    // Increase timeout to allow MongoDB Memory Server to be donwloaded
    // the first time
    jest.setTimeout(120000);

    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri);
});

afterAll(() => {
    mongoose.disconnect();
    mongod.stop();
});

beforeEach(async () => {
    mongoose.connection.db.dropDatabase();
    await addFakeAuthors();
});

async function addFakeAuthors() {
    const author1 = new Author({
        name: "paulo",
        age: 49
    });
    await author1.save();

    const author2 = new Author({
        name: "john",
        age: 50
    });

    await author2.save();
}

test("POST /books should create new book", async () => {
    let paulo = await Author.find({ name: "paulo" });
    const response = await request(app).post("/books").send(
        {
            title: "Where's Paulo",
            author: `${paulo[0]._id}`,
            price: 25
        })
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("created new book with title Where's Paulo ");
})

test("GET /books/:id should retrieve selected book", async () => {
    let paulo = await Author.find({ name: "paulo" });
    const book = new Book({
        title: "Where's Paulo",
        author: `${paulo[0]._id}`,
        price: 25
    })

    let bookd = await book.save();
    let url = `/books/${bookd.id}`;
    const response = await request(app).get(url);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(`found book with id ${bookd.id}`);
})

test("PUT /books/:id should update selected book", async () => {
    let paulo = await Author.find({ name: "paulo" });
    let john = await Author.find({ name: "john" });
    const book = new Book({
        title: "Where's Paulo",
        author: `${paulo[0]._id}`,
        price: 25
    })
    let bookd = await book.save();
    let url = `/books/${bookd.id}`;
    const response = await request(app).put(url).send({ title: "Finding Paulo", author: `${john[0].id}`, price: 25 });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(`updated book with id "${bookd.id}"`);
    expect(response.body.result.title).toBe("Finding Paulo");
})

test("DELETE /books/:id should delete selected book", async () => {
    let paulo = await Author.find({ name: "paulo" });
    const book = new Book({
        title: "Where's Paulo",
        author: `${paulo[0]._id}`,
        price: 25
    })

    let bookd = await book.save();
    let url = `/books/${bookd.id}`;
    const response = await request(app).delete(url);
    let db = await request(app).get("/books");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(`deleted book with id "${bookd.id}"`);
    expect(db.body.length).toBe(0);
})