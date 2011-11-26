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

import java.sql.DataTruncation;

/**
 * MySQL wrapper for DataTruncation until the server can support sending all
 * needed information.
 * 
 * @author Mark Matthews
 * 
 * @version $Id: MysqlDataTruncation.java,v 1.1.2.1 2005/05/13 18:58:38
 *          mmatthews Exp $
 */
public class MysqlDataTruncation extends DataTruncation {

	private String message;

	private int vendorErrorCode;
	
	/**
	 * Creates a new MysqlDataTruncation exception/warning.
	 * 
	 * @param message
	 *            the message from the server
	 * @param index
	 *            of column or parameter
	 * @param parameter
	 *            was a parameter?
	 * @param read
	 *            was truncated on read?
	 * @param dataSize
	 *            size requested
	 * @param transferSize
	 *            size actually used
	 */
	public MysqlDataTruncation(String message, int index, boolean parameter,
			boolean read, int dataSize, int transferSize, int vendorErrorCode) {
		super(index, parameter, read, dataSize, transferSize);

		this.message = message;
		this.vendorErrorCode = vendorErrorCode;
	}

	public int getErrorCode() {
		return this.vendorErrorCode;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Throwable#getMessage()
	 */
	public String getMessage() {
		return super.getMessage() + ": " + this.message; //$NON-NLS-1$
	}
}
