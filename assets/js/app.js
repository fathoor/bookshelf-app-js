let books = [];
const STORAGE_KEY = "BOOKSHELF_APP"; 
const SAVED_EVENT = "ondatasaved";
const RENDER_EVENT = "ondataloaded";

const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert("Browser doesn't support local storage");
    return false;
  }
  return true;
}

const saveData = () => {
    if (isStorageExist()) {
        const parsedData = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsedData);
        document.dispatchEvent(new Event(SAVED_EVENT));
    };
}

const loadData = () => {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

const generateBookObject = (title, author, year, isComplete) => {
    return {
        id: +new Date(),
        title,
        author,
        year,
        isComplete
    };
}

const addBook = () => {
    const title = document.getElementById("insertTitle").value;
    const author = document.getElementById("insertAuthor").value;
    const year = document.getElementById("insertYear").value;
    const isComplete = document.getElementById("insertIsComplete").checked;
    const book = generateBookObject(title, author, year, isComplete);
    books.push(book);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

const makeBook = (bookObject) => {
    const {id, title, author, year, isComplete} = bookObject;

    const bookTitle = document.createElement("h3");
    bookTitle.innerText = title;

    const bookAuthor = document.createElement("p");
    bookAuthor.innerText = "Author: " + author;

    const bookYear = document.createElement("p");
    bookYear.innerText = "Year: " + year;

    const action = document.createElement("div");

    const article = document.createElement("article");
    article.classList.add("item");
    article.setAttribute("id", id);
    article.append(bookTitle, bookAuthor, bookYear);

    if (isComplete) {
        const createUndoButton = () => {
            return createButton("bookUndo", "bi-arrow-counterclockwise", function (event) {
                undoBookFromCompleted(id);
            });
        }

        const createTrashButton = () => {
            return createButton("bookDelete", "bi-trash", function (event) {
                let confirm = window.confirm("Are you sure to delete this book?");
                if (confirm) {
                    removeBookFromCompleted(id);
                }
            });
        };

        action.append(
            createUndoButton(),
            createTrashButton()
        );
        article.append(action);
    } else {
        const createCheckButton = () => {
            return createButton("bookComplete", "bi-check", function (event) {
                addBookToCompleted(id);
            });
        };

        const createTrashButton = () => {
            return createButton("bookDelete", "bi-trash", function (event) {
                let confirm = window.confirm("Are you sure to delete this book?");
                if (confirm) {
                    removeBookFromCompleted(id);
                }
            });
        }

        action.append(
            createCheckButton(),
            createTrashButton()
        );
        article.append(action);
    }

    return article;
}

const createButton = (buttonTypeClass, buttonIconClass, eventListener) => {
    const button = document.createElement("button");
    const icon = document.createElement("i");
    icon.classList.add("bi", buttonIconClass);
    button.classList.add(buttonTypeClass);
    button.setAttribute("onclick", "window.location.reload()");
    button.append(icon);
    button.addEventListener("click", function (event) {
        eventListener(event);
    });
    return button;
}

const addBookToCompleted = (bookId) => {
    const book = findBook(bookId);
    book.isComplete = true;
    saveData();
}

const removeBookFromCompleted = (bookId) => {
    const bookPosition = findBookIndex(bookId);
    books.splice(bookPosition, 1);
    saveData();
}

const undoBookFromCompleted = (bookId) => {
    const book = findBook(bookId);
    book.isComplete = false;
    saveData();
}

const findBook = (bookId) => {
    for (const book of books) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

const findBookIndex = (bookId) => {
    let index = 0;
    for (const book of books) {
        if (book.id === bookId) {
            return index;
        }
        index++;
    }
    return -1;
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("insert");
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        addBook();
    });
    if (isStorageExist()) loadData();
});

document.addEventListener(SAVED_EVENT, () => {
    console.log("Data successfully saved.");
});

document.addEventListener(RENDER_EVENT, () => {
    const completedBooks = document.getElementById("completedBooks");
    const incompletedBooks = document.getElementById("incompletedBooks");

    completedBooks.innerHTML = "";
    incompletedBooks.innerHTML = "";

    for (const book of books) {
        const newBook = makeBook(book);

        if (book.isComplete) {
            completedBooks.append(newBook);
        } else {
            incompletedBooks.append(newBook);
        }
    }
});