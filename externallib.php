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
 * External functions backported.
 *
 * @package    format_mytopcoll
 * @copyright
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
defined('MOODLE_INTERNAL') || die;

require_once($CFG->libdir . "/externallib.php");
require_once($CFG->dirroot . '/course/format/lib.php');

class format_mytopcoll_external extends external_api {

    /**
     * Returns description of method parameters
     * @return external_function_parameters
     */
    public static function delete_indicator_parameters() {
        return new external_function_parameters(
                array(
            'indicatorid' => new external_value(PARAM_INT, 'Indicator ID')
                )
        );
    }

    // Rewrite all coords.
    public static function delete_indicator($indicatorid) {
        global $DB;
        $params = self::validate_parameters(self::delete_indicator_parameters(),
                        array(
                            'indicatorid' => (int) $indicatorid,
                        )
        );

        return $DB->delete_records('format_mytopcoll_indicator', array ('id' => $indicatorid));
    }

    /**
     * Returns description of method result value
     * @return external_description
     */
    public static function delete_indicator_returns() {
        return new external_value(PARAM_BOOL, 'status: true if success');
    }

    /**
     * Returns description of method parameters
     * @return external_function_parameters
     */
    public static function get_edit_indicator_parameters() {
        return new external_function_parameters(
                array(
                    'courseid' => new external_value(PARAM_INT, 'Course ID'),
                    'indicatorid' => new external_value(PARAM_INT, 'Indicator ID')
                )
        );
    }

    // Rewrite all coords.
    public static function get_edit_indicator($courseid, $indicatorid) {
        global $DB;
        $params = self::validate_parameters(self::get_edit_indicator_parameters(),
                        array(
                            'courseid' => (int) $courseid,
                            'indicatorid' => (int) $indicatorid,
                        )
        );

        return course_get_format($courseid)->render_modchooser_template($courseid, $indicatorid);
    }

    /**
     * Returns description of method result value
     * @return external_description
     */
    public static function get_edit_indicator_returns() {
        return new external_value(PARAM_RAW, 'The result new data for indicator');
    }

    /**
     * Returns description of method parameters
     * @return external_function_parameters
     */
    public static function set_edit_indicator_parameters() {
        return new external_function_parameters(
                array(
                    'courseid' => new external_value(PARAM_INT, 'Course ID'),
                    'indicatorid' => new external_value(PARAM_INT, 'Indicator ID'),
                    'data' => new external_value(PARAM_TEXT, 'Activity types')
                )
        );
    }

    public static function set_edit_indicator($courseid, $indicatorid, $data) {
        global $DB;
        $params = self::validate_parameters(self::set_edit_indicator_parameters(),
                        array(
                            'courseid' => (int) $courseid,
                            'indicatorid' => (int) $indicatorid,
                            'data' => $data,
                        )
        );
        if ($indicatorid) {
            $dataobject = $DB->get_record('format_mytopcoll_indicator', array('id' => $indicatorid), '*', MUST_EXIST);
            $dataobject->types = $data;
            $update = $DB->update_record('format_mytopcoll_indicator', $dataobject);
            return $DB->update_record('format_mytopcoll_indicator', $dataobject);
        }else {
            $data =  json_decode($data);
            $dataobject = new stdClass();
            $dataobject->name = $data->name;
            $dataobject->types = json_encode($data->types);
            $dataobject->courseid = $courseid;
            return $DB->insert_record('format_mytopcoll_indicator', $dataobject);
        }
    }

    /**
     * Returns description of method result value
     * @return external_description
     */
    public static function set_edit_indicator_returns() {
        return new external_value(PARAM_INT, 'record id');
    }

    /**
     * Returns description of method parameters
     * @return external_function_parameters
     */
    public static function update_indicator_name_parameters() {
        return new external_function_parameters(
                array(
                    'indicatorid' => new external_value(PARAM_INT, 'Indicator ID'),
                    'indicatorname' => new external_value(PARAM_TEXT, 'Indicator name')
                )
        );
    }

    public static function update_indicator_name($indicatorid, $indicatorname) {
        global $DB;
        $params = self::validate_parameters(self::update_indicator_name_parameters(),
                        array(
                            'indicatorid' => (int) $indicatorid,
                            'indicatorname' => $indicatorname,
                        )
        );
        $dataobject = $DB->get_record('format_mytopcoll_indicator', array('id' => $indicatorid), '*', MUST_EXIST);
        $dataobject->name = $indicatorname;
        $update = $DB->update_record('format_mytopcoll_indicator', $dataobject);

        return $update ? 1 : 0;
    }

    /**
     * Returns description of method result value
     * @return external_description
     */
    public static function update_indicator_name_returns() {
        return new external_value(PARAM_BOOL, 'status: true if success');
    }
}
