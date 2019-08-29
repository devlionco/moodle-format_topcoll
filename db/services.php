<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Web service external functions and service definitions.
 *
 * @package    format_mytopcoll
 * @copyright  2019 Devlion.co
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

// We defined the web service functions to install.
$functions = array(
    'format_mytopcoll_delete_indicator' => array(
        'classname' => 'format_mytopcoll_external',
        'methodname' => 'delete_indicator',
        'classpath' => 'course/format/mytopcoll/externallib.php',
        'description' => 'Delete current activity indicator',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'format/mytopcoll:editcourseformat',
        'services' => array(MOODLE_OFFICIAL_MOBILE_SERVICE)
    ),
    'format_mytopcoll_get_edit_indicator' => array(
        'classname' => 'format_mytopcoll_external',
        'methodname' => 'get_edit_indicator',
        'classpath' => 'course/format/mytopcoll/externallib.php',
        'description' => 'Edit current activity indicator',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'format/mytopcoll:editcourseformat',
        'services' => array(MOODLE_OFFICIAL_MOBILE_SERVICE)
    ),
    'format_mytopcoll_set_edit_indicator' => array(
        'classname' => 'format_mytopcoll_external',
        'methodname' => 'set_edit_indicator',
        'classpath' => 'course/format/mytopcoll/externallib.php',
        'description' => 'Edit current activity indicator',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'format/mytopcoll:editcourseformat',
        'services' => array(MOODLE_OFFICIAL_MOBILE_SERVICE)
    ),
);
