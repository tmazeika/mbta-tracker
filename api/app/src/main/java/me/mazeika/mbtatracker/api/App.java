package me.mazeika.mbtatracker.api;

import spark.Response;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

import static spark.Spark.before;
import static spark.Spark.get;
import static spark.Spark.options;

public final class App {
    public static void main(String[] args) {
        before((req, res) -> {
            res.header("Access-Control-Allow-Origin", "*");
        });
        options("/*", (req, res) -> {
            final var headers = req.headers("Access-Control-Request-Headers");
            if (headers != null) {
                res.header("Access-Control-Allow-Headers", headers);
            }
            final var method = req.headers("Access-Control-Request-Method");
            if (method != null) {
                res.header("Access-Control-Allow-Methods", method);
            }
            res.status(200);
            return null;
        });

        get("/vehicles", (req, res) -> {
            final var conn =
                    new URL("https://api-v3.mbta.com/vehicles?filter[route]=Red,Orange,Green-B,Green-C,Green-D,Green-E,Blue").openConnection();
            conn.setRequestProperty("Accept", "text/event-stream");
            conn.setRequestProperty("X-API-Key", System.getenv("MBTA_API_KEY"));
            try (final var in = conn.getInputStream()) {
                res.status(200);
                res.type("text/event-stream");
                pipe(in, res);
            }
            return null;
        });

        get("/routes", (req, res) -> {
            final var conn =
                    new URL("https://api-v3.mbta.com/routes").openConnection();
            conn.setRequestProperty("X-API-Key", System.getenv("MBTA_API_KEY"));
            try (final var in = conn.getInputStream()) {
                res.status(200);
                res.type("application/json");
                pipe(in, res);
            }
            return null;
        });

        get("/stops", (req, res) -> {
            final var conn =
                    new URL("https://api-v3.mbta.com/stops?filter[route]=Red,Orange,Green-B,Green-C,Green-D,Green-E,Blue").openConnection();
            conn.setRequestProperty("X-API-Key", System.getenv("MBTA_API_KEY"));
            try (final var in = conn.getInputStream()) {
                res.status(200);
                res.type("application/json");
                pipe(in, res);
            }
            return null;
        });
    }

    private static void pipe(InputStream in, Response res) throws IOException {
        final var out = res.raw().getOutputStream();
        final var buf = new byte[4096];
        int length;
        while ((length = in.read(buf)) != -1) {
            for (var i = 0; i < length; i++) {
                out.write(buf[i]);
            }
            out.flush();
        }
    }
}
