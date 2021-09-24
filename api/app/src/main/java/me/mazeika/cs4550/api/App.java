package me.mazeika.cs4550.api;

import static spark.Spark.*;

public final class App {
    public static void main(String[] args) {
        get("/hello", (req, res) -> "Hello World");
    }
}
