<?php

require 'vendor/autoload.php';

if (!ini_get('display_errors')) {
    ini_set('display_errors', 1);
}

$code = $_GET['code'];

//get config
if (file_exists("../config.json")) {
    $config = file_get_contents("../config.json");
} else {
    $config = "{}";
}
$configArr = new stdClass;

$jsonIterator = new RecursiveIteratorIterator(
    new RecursiveArrayIterator(json_decode($config, TRUE)),
    RecursiveIteratorIterator::SELF_FIRST);

foreach ($jsonIterator as $key => $val) {
    //todo fix for array is_array
    $configArr->$key = $val;
}

if (!isset($configArr->client_id)) {
    $configArr->client_id = getenv('TIMER_CLIENT_ID');
}
if (!isset($configArr->client_secret)) {
    $configArr->client_secret = getenv('TIMER_CLIENT_SECRET');
}
if (!isset($configArr->redirect_uri)) {
    $configArr->redirect_uri = getenv('TIMER_REDIRECT_URI');
}

$client = new Google_Client();
$client->setClientId($configArr->client_id);
$client->setClientSecret($configArr->client_secret);
$client->setRedirectUri($configArr->redirect_uri);

$client->authenticate($code);

$access_token = $client->getAccessToken();

$access_token_arr = json_decode($access_token);

$client->setAccessToken($access_token);

$curl = curl_init();

curl_setopt_array(
    $curl,
        array(
            CURLOPT_URL => 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token='.$access_token_arr->access_token,
            CURLOPT_RETURNTRANSFER => TRUE
        )
    );

$user_info = curl_exec($curl);

curl_close($curl);

header("Content-Type: text/html;charset=utf-8");

$user_info_arr = json_decode($user_info);

//check user
try
{
    $db = getConnection();

    $sql = "select * from users where email='".$user_info_arr->email."'";
    $stmt = $db->prepare($sql);
    $stmt->execute();

    $user = $stmt->fetchAll(PDO::FETCH_OBJ);

    $db = null;            

    $result = json_encode($user[0]);
} catch(PDOException $e) {
    $result = '{"error":{"text":'. $e->getMessage() .'}}';
}

//create user
if (!$user) {
    try
    {
        $db = getConnection();

        $sql = "insert into users (`email`) values(?)";
        $stmt = $db->prepare($sql);
        $stmt->execute(array(
            $user_info_arr->email
        ));

        $data->id = $db->lastInsertId();

	    $sql = "select * from users where id=".$data->id;
	    $stmt = $db->prepare($sql);
	    $stmt->execute();

	    $user = $stmt->fetchAll(PDO::FETCH_OBJ);

	    $db = null;            

	    $result = json_encode($user[0]);
    } catch(PDOException $e) {
        $result = '{"error project":{"text":'. $e->getMessage() .'}}';
    }
}

session_start();
$_SESSION['user'] = $result;
header('Location: /');

function getConnection() {
    $config = file_get_contents("../config.json");
    $configArr = new stdClass;

    $jsonIterator = new RecursiveIteratorIterator(
        new RecursiveArrayIterator(json_decode($config, TRUE)),
        RecursiveIteratorIterator::SELF_FIRST);

    foreach ($jsonIterator as $key => $val) {
        //todo fix for array is_array
        $configArr->$key = $val;
    }

    $dbhost=$configArr->dbhost;
    $dbuser=$configArr->dbuser;
    $dbpass=$configArr->dbpass;
    $dbname=$configArr->dbname;

    $dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);  
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $dbh;
}
