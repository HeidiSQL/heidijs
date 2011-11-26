/*
 Copyright (c) 2002, 2010, Oracle and/or its affiliates. All rights reserved.
 

  The MySQL Connector/J is licensed under the terms of the GPLv2
  <http://www.gnu.org/licenses/old-licenses/gpl-2.0.html>, like most MySQL Connectors.
  There are special exceptions to the terms and conditions of the GPLv2 as it is applied to
  this software, see the FLOSS License Exception
  <http://www.mysql.com/about/legal/licensing/foss-exception.html>.

  This program is free software; you can redistribute it and/or modify it under the terms
  of the GNU General Public License as published by the Free Software Foundation; version 2
  of the License.

  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with this
  program; if not, write to the Free Software Foundation, Inc., 51 Franklin St, Fifth
  Floor, Boston, MA 02110-1301  USA

 */

package com.mysql.jdbc;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import com.mysql.jdbc.log.Log;
import com.mysql.jdbc.profiler.ProfilerEventHandler;

/**
 * @author mmatthew
 */
public class ProfilerEventHandlerFactory {

	private static final Map CONNECTIONS_TO_SINKS = new HashMap();

	private Connection ownerConnection = null;

	private Log log = null;

	/**
	 * Returns the ProfilerEventHandlerFactory that handles profiler events for the given
	 * connection.
	 * 
	 * @param conn
	 *            the connection to handle events for
	 * @return the ProfilerEventHandlerFactory that handles profiler events
	 */
	public static synchronized ProfilerEventHandler getInstance(MySQLConnection conn) throws SQLException {
		ProfilerEventHandler handler = (ProfilerEventHandler) CONNECTIONS_TO_SINKS
				.get(conn);

		if (handler == null) {
			handler = (ProfilerEventHandler)Util.getInstance(conn.getProfilerEventHandler(), new Class[0], new Object[0], conn.getExceptionInterceptor());
			
			// we do it this way to not require
			// exposing the connection properties 
			// for all who utilize it
			conn.initializeExtension(handler);
			
			CONNECTIONS_TO_SINKS.put(conn, handler);
		}

		return handler;
	}

	public static synchronized void removeInstance(Connection conn) {
		ProfilerEventHandler handler = (ProfilerEventHandler) CONNECTIONS_TO_SINKS.remove(conn);
		
		if (handler != null) {
			handler.destroy();
		}
	}

	private ProfilerEventHandlerFactory(Connection conn) {
		this.ownerConnection = conn;

		try {
			this.log = this.ownerConnection.getLog();
		} catch (SQLException sqlEx) {
			throw new RuntimeException("Unable to get logger from connection");
		}
	}
}