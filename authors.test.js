const express = require("express");
const request = require("supertest");

const MongodbMemoryServer = require("mongodb-memory-server").default;
const mongod = new MongodbMemoryServer();
const mongoose = require("mongoose");
const Author = require("./models/author");
const Book = require("./models/book");

const app = require("./app");

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

    const book2 = new Book({
        title: "Johnny English",
        author: `${aut1.id}`,
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
});

test("POST /authors should create new author", async () => {
    let newAuthor = {
        name: "paulo",
        age: 49
    }
    const response = await request(app)
        .post("/authors")
        .send(newAuthor)
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("created new author with name paulo ");
})

test("GET /authors/:id should retrieve selected author with book details", async () => {
    await addFakeBooks();
    let paulo = await Author.find({ name: "paulo" });
    let url = `/authors/${paulo[0]._id}`;
    const response = await request(app)
        .get(url);

    expect(response.status).toBe(200);
    expect(response.body.author.name).toBe("paulo");
    expect(response.body.books.length).toBe(2);
})

test("PUT /authors/:id should update selected author", async () => {
    const author1 = new Author({
        name: "paulo",
        age: 49
    });
    let aut1 = await author1.save();
    let url = `/authors/${aut1.id}`;
    const response = await request(app).put(url).send({ name: "Tom", age: 25 });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(`updated author with id "${aut1.id}"`);
})

test("DELETE /authors/:id should delete selected author", async () => {
    const author = new Author({
        name: "paulo",
        age: 49
    });
    let aut = await author.save();
    let url = `/authors/${aut.id}`;
    let response = await request(app).delete(url);
    let db = await request(app).get("/authors");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(`deleted author with id "${aut.id}"`);
    expect(db.body.length).toBe(0);
})
