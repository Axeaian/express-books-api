// app.test.js
const express = require("express");
const request = require("supertest");

// Initialize MongoDB Memory Server
const MongodbMemoryServer = require("mongodb-memory-server").default;
const mongod = new MongodbMemoryServer();
const mongoose = require("mongoose");
const Author = require("./models/author");
const Book = require("./models/book");

const app = require("./app");

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
async function addFakeBooks() {
    const author1 = new Author({
        name: "paulo",
        age: 49
    });
    let aut1 = await author1.save();

    const book1 = new Book({
        title: "Where's Paulo",
        author: `${aut1.id}`,
        price: 25
    });
    await book1.save();

    const author2 = new Author({
        name: "john",
        age: 50
    });

    let aut2 = await author2.save();

    const book2 = new Book({
        title: "Johnny English",
        author: `${aut2.id}`,
        price: 30
    });

    await book2.save();
}

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
    // Clean DB between test runs
    mongoose.connection.db.dropDatabase();

    // Add fake data to the DB to be used in the tests
    // await addFakeAuthors();
    // await addFakeBooks();
});

test("GET /authors should display all authors", async () => {
    await addFakeAuthors();
    const response = await request(app).get("/authors");

    expect(response.status).toBe(200);

    // Assert based on the fake data added
    expect(response.body.length).toBe(2);
});

test("GET /books should display all books", async () => {
    await addFakeBooks();
    const response = await request(app).get("/books");

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
});

test("GET /index should display welcome message", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual("hello express-books-api");
});

test("GET /authors?name=paulo should display details of paulo", async () => {
    await addFakeBooks();
    const response = await request(app).get("/authors?name=paulo");

    expect(response.status).toBe(200);
    expect(response.body.books.length).toBe(1);
});


