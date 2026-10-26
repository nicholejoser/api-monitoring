import { NextRequest, NextResponse } from "next/server";
import { tripleDecode } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getRequestInfo } from "../route";
import { createUserLog } from "@/lib/logs";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const decodedID = tripleDecode(id);
  const body = await req.json();

  const user = await prisma.users.update({
    where: {
      id: Number(decodedID),
    },
    data: {
      username: body.username,
      firstname: body.firstname,
      lastname: body.lastname,
      email: body.email,
      ...(body.password
        ? { password: await bcrypt.hash(body.password, 10) }
        : {}),
      role_id: body.roleId,
    },
    select: {
      id: true,
      username: true,
      firstname: true,
      lastname: true,
      email: true,
      createdAt: true,
      role_id: true,
      roles: true,
      receiveAlarmEmail: true,
    },
  });
  const { ipAddress, userAgent } = getRequestInfo(req);

  await createUserLog({
    userId: currentUser.id,
    action: "UPDATE_USER",
    description: `Update user "${user.username}"`,
    ipAddress,
    userAgent,
  });
  return NextResponse.json({
    data: user,
    message: "Account updated successfully!",
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const decodedID = tripleDecode(id);
  const user = await prisma.users.delete({
    where: {
      id: Number(decodedID),
    },
  });
  const { ipAddress, userAgent } = getRequestInfo(req);

  await createUserLog({
    userId: currentUser.id,
    action: "DELETE_USER",
    description: `Delete user "${user.username}"`,
    ipAddress,
    userAgent,
  });
  return NextResponse.json({
    message: "User deleted successfully.",
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  try {
    const { receiveAlarmEmail } = await req.json();

    if (typeof receiveAlarmEmail !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid receiveAlarmEmail value.",
        },
        { status: 400 },
      );
    }

    const { id } = await params;
    const decodedID = tripleDecode(id);
    const userId = Number(decodedID);

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID.",
        },
        { status: 400 },
      );
    }

    const existingUser = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User does not exist.",
        },
        { status: 404 },
      );
    }

    const updatedUser = await prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        receiveAlarmEmail,
      },
      select: {
        id: true,
        username: true,
        email: true,
        receiveAlarmEmail: true,
      },
    });

    const { ipAddress, userAgent } = getRequestInfo(req);

    await createUserLog({
      userId: currentUser.id,
      action: "UPDATE_USER",
      description: `Updated alarm email setting for user "${existingUser.username}" to ${
        receiveAlarmEmail ? "enabled" : "disabled"
      }`,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: receiveAlarmEmail
        ? "Alarm email notifications enabled."
        : "Alarm email notifications disabled.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE USER ALARM EMAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update alarm email setting.",
      },
      { status: 500 },
    );
  }
}
