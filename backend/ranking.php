<?php

header('Content-Type: application/json; charset=utf-8');

//Import the librarys.
require_once("response.php");
require_once("constants.php");
require_once("database.php");

//If the action is defined and is not empty.
if (isset($_POST["action"]) && !empty($_POST["action"])) {
    //Get the action name.
    $action = $_POST["action"];

    //Check if the action exists.
    if (function_exists($action)) {
        //Call the action.
        $action();
    } else {
        Response::send(array("msg" => "Function not exists."), Response::HTTP_METHOD_NOT_ALLOWED);
    }
} else {
    Response::send(array("msg" => "Param 'action' missing."), Response::HTTP_METHOD_NOT_ALLOWED);
}


function get()
{
    $ranking = [];
    $ranking_user = null;

    $top = isset($_POST["top"]) ? $_POST["top"] : 10;
    $id_game = isset($_POST["id_game"]) ? $_POST["id_game"] : -1;
    $id_user = isset($_POST["id_user"]) ? $_POST["id_user"] : -1;

    try {
        if ($id_game !== -1 && $id_user !== -1) {
            $db = new Database();

            $statement = $db->connect()->prepare("SELECT u.id, u.nickname, ugc.points, IFNULL(ugc.hits, 0) as win
                                                  FROM user_game_cycle ugc
                                                  INNER JOIN user u ON u.id = ugc.id_user
                                                  WHERE ugc.id_game = :id_game
                                                  ORDER BY  ugc.hits DESC, ugc.points DESC
                                                  LIMIT :top");

            $statement->bindParam(":id_game", $id_game);
            $statement->bindParam(":top", $top);

            $statement->execute();

            $inTop = false;
            
            foreach ($statement->fetchAll(PDO::FETCH_ASSOC) as $row) {

                if ($row["id"] == $id_user) {
                    $inTop = true;
                }

                array_push($ranking, array("id" => $row["id"], "nickname" => $row["nickname"], "points" => $row["points"], "win" => $row["win"]));
            }

            //If the user is not in the top 10.
            if (!$inTop) {
                $statement = $db->connect()->prepare("SELECT u.id, u.nickname, ugc.points, IFNULL(ugc.hits, 0) as win
                                                      FROM user_game_cycle ugc
                                                      INNER JOIN user u ON u.id = ugc.id_user
                                                      WHERE ugc.id_game = :id_game AND ugc.id_user = :id_user
                                                      LIMIT 1");

                $statement->bindParam(":id_game", $id_game);
                $statement->bindParam(":id_user", $id_user);

                $statement->execute();

                if ($statement->rowCount() > 0) {
                    $ranking_user = $statement->fetch(PDO::FETCH_ASSOC);
                }
            }

            Response::send(array("msg" => "Ok.", "data" => $ranking, "data_user" => $ranking_user), Response::HTTP_OK);
        } else {
            Response::send(array("msg" => "Game not found."), Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    } catch (PDOException $e) {
        Response::send(array("msg" => "An unexpected error has occurred: " . $e->getMessage()), Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}
