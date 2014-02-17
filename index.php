<?php
/**
 * Step 1: Require the Slim Framework
 *
 * If you are not using Composer, you need to require the
 * Slim Framework and register its PSR-0 autoloader.
 *
 * If you are using Composer, you can skip this step.
 */
require 'Slim/Slim.php';

\Slim\Slim::registerAutoloader();

/**
 * Step 2: Instantiate a Slim application
 *
 * This example instantiates a Slim application using
 * its default settings. However, you will usually configure
 * your Slim application now by passing an associative array
 * of setting names and values into the application constructor.
 */
$app = new \Slim\Slim();

/**
 * Step 3: Define the Slim application routes
 *
 * Here we define several Slim application routes that respond
 * to appropriate HTTP request methods. In this example, the second
 * argument for `Slim::get`, `Slim::post`, `Slim::put`, `Slim::patch`, and `Slim::delete`
 * is an anonymous function.
 */

// GET route
$app->get(
    '/',
    function () use ($app) {
        include("index.html");
    }
);

$app->get(
    '/tasks',
    function () use ($app) {

        try
        {
            $db = getConnection();

            $sql = "select * from tasks";
            $stmt = $db->prepare($sql);
            $stmt->execute();

            $tasks = $stmt->fetchAll(PDO::FETCH_OBJ);

            $db = null;            

            echo json_encode($tasks);
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }

    }
);

// POST route
$app->post(
    '/task',
    function () use ($app) {

        //$data = json_decode(file_get_contents('php://input'));
        $data = json_decode($app->request()->getBody());

        try
        {
            $db = getConnection();

            $sql = "insert into tasks (`time`, `time_str`,`desc`) values(?, ?, ?)";
            $stmt = $db->prepare($sql);
            $stmt->execute(array(
                $data->time,
                $data->time_str,
                $data->desc
            ));
            $data->id = $db->lastInsertId();

            echo json_encode($data);
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }
    }
);

// PUT route
$app->put(
    '/task/:id',
    function ($id) use ($app) {

        //$data = json_decode(file_get_contents('php://input'));
        $data = json_decode($app->request()->getBody());

        //echo json_encode($data);

        try
        {
            $db = getConnection();

            $sql = "update tasks set `time` = :time, `time_str` = :time_str, `desc` = :desc where id=".$id;
            $stmt = $db->prepare($sql);
            $stmt->bindParam(":time", $data->time);
            $stmt->bindParam(":time_str", $data->time_str);
            $stmt->bindParam(":desc", $data->desc);
            $stmt->execute();

            echo '{"status": "ok"}';
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }

    }
);

$app->delete(
    '/task/:id',
    function ($id) use ($app) {

        try
        {
            $db = getConnection();

            $sql = "delete from tasks where id=".$id;
            $stmt = $db->prepare($sql);
            $stmt->execute();

            echo '{"status": "ok"}';
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }

    }
);

$app->get(
    '/task/:id',
    function ($id) use ($app) {
        echo '{"get":{"text":'. $id.'}}';
    }
);

// PATCH route
$app->patch('/patch', function () {
    echo 'This is a PATCH route';
});

// DELETE route
$app->delete(
    '/delete',
    function () {
        echo 'This is a DELETE route';
    }
);

/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This executes the Slim application
 * and returns the HTTP response to the HTTP client.
 */
$app->run();

function getConnection() {
    $dbhost="127.0.0.1";
    $dbuser="root";
    $dbpass="";
    $dbname="timer";
    $dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);  
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $dbh;
}