import {
  ConsumptionGroupedByClient,
  DailyConsumption,
  TerminalNode,
} from "@/components/Types";
import { incrementProgress, resetProgress, setRunning } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reqType = searchParams.get("type");

  setRunning(true);
  resetProgress();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      setRunning(false);
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    const text = await file.text();
    const json = JSON.parse(text);
    if (reqType === "consumption") {
      const flatData = json.flatMap((client: ConsumptionGroupedByClient) =>
        client.data.map((row: DailyConsumption) => ({
          id: row.id,
          client_id: client.clientId,
          terminal_node_id: row.terminalNodeId,
          up: Number(row.up),
          down: Number(row.down),
          consumption_day: row.consumptionDay,
          created_at: row.createdAt,
        })),
      );

      const chunkSize = 1000;

      for (let i = 0; i < flatData.length; i += chunkSize) {
        const chunk = flatData.slice(i, i + chunkSize);
        incrementProgress(chunk.length);

        const { error } = await supabase.from("consumptions").upsert(chunk, {
          onConflict: "id",
        });
        if (error) {
          console.error(error);
          setRunning(false);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
      setRunning(false);
      return NextResponse.json({
        success: true,
        total: flatData.length,
      });
    } else if (reqType === "terminal_node") {
      const flatData = json.map((node: TerminalNode) => ({
        city_id: node.cityId,
        city_name: node.cityName,
        client_id: node.clientId,
        client_identifier: node.clientIdentifier,
        client_name: node.clientName,
        client_outer_identifier: node.clientOuterIdentifier,
        comment: node.comment,
        contact: node.contact,
        contract: node.contract,
        created_at: node.createdAt,
        created_by_id: node.createdById,
        created_by_name: node.createdByName,
        custom_vlan_tagging_iptv_id: node.customVlanTaggingIptvId,
        custom_vlan_tagging_net_id: node.customVlanTaggingNetId,
        deleted_at: node.deletedAt,
        deleted_by_id: node.deletedById,
        email: node.email,
        fix_ip: node.fixIp,
        hooked_at: node.hookedAt,
        hooked_by_id: node.hookedById,
        hooked_by_name: node.hookedByName,
        id: node.id,
        is_ftth: node.isFtth,
        is_pppoe: node.isPppoe,
        is_pppoe_active: node.isPppoeActive,
        language: node.language,
        map_data_id: node.mapDataId,
        map_data_name: node.mapDataName,
        modified_at: node.modifiedAt,
        modified_by_id: node.modifiedById,
        modified_by_name: node.modifiedByName,
        name: node.name,
        number: node.number,
        number_ext: node.numberExt,
        olt_name: node.oltName,
        onu_olt_id: node.onuOltId,
        optical_device_id: node.opticalDeviceId,
        outer_identity: node.outerIdentity,
        package_name: node.packageName,
        password: node.password,
        phone: node.phone,
        radius_password: node.radiusPassword,
        radius_username: node.radiusUsername,
        rf_enabled: node.rfEnabled,
        serial_number: node.serialNumber,
        service_area_id: node.serviceAreaId,
        service_area_name: node.serviceAreaName,
        sip_data: node.sipData,
        status: node.status,
        status_id: node.statusId,
        status_operational: node.statusOperational,
        street_id: node.streetId,
        street_name: node.streetName,
        terminal_node_olt_id: node.terminalNodeOltId,
        todo_count: node.todoCount,
        todo_task_ids: node.todoTaskIds,
        tr069_enabled: node.tr069Enabled,
        voip_provider: node.voipProvider,
        voip_provider_id: node.voipProviderId,
        wifi: node.wifi,
      }));
      const chunkSize = 1000;

      for (let i = 0; i < flatData.length; i += chunkSize) {
        const chunk = flatData.slice(i, i + chunkSize);
        incrementProgress(chunk.length);

        const { error } = await supabase.from("terminal_nodes").upsert(chunk, {
          onConflict: "id",
        });

        if (error) {
          console.error(error);
          setRunning(false);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
      setRunning(false);
      return NextResponse.json({
        message: `${reqType.charAt(0).toUpperCase() + reqType.slice(1)} nodes imported successfully`,
        success: true,
        total: flatData.length,
      });
    }
  } catch (error) {
    console.error(error);
    setRunning(false);

    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 100);

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // =========================
    // CONSUMPTIONS
    // =========================
    if (type === "consumptions") {
      const clientId = searchParams.get("clientId");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      let query = supabase
        .from("consumptions")
        .select("*", { count: "exact" })
        .range(start, end)
        .order("consumption_day", {
          ascending: false,
        });

      if (clientId) {
        query = query.eq("client_id", Number(clientId));
      }

      if (startDate) {
        query = query.gte(
          "consumption_day",
          startDate,
        );
      }

      if (endDate) {
        query = query.lte(
          "consumption_day",
          endDate,
        );
      }

      const { data, error, count } =
        await query;

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        type,
        page,
        limit,
        total: count,
        totalPages: Math.ceil(
          (count || 0) / limit,
        ),
        data,
      });
    }

    // =========================
    // TERMINAL NODES
    // =========================
    if (type === "terminal_nodes") {
      const clientId = searchParams.get("clientId");
      const status = searchParams.get("status");
      const cityId = searchParams.get("cityId");

      let query = supabase
        .from("terminal_nodes")
        .select("*", { count: "exact" })
        .range(start, end)
        .order("created_at", {
          ascending: false,
        });

      if (clientId) {
        query = query.eq("client_id", Number(clientId));
      }

      if (status) {
        query = query.eq("status", status);
      }

      if (cityId) {
        query = query.eq("city_id", Number(cityId));
      }

      const { data, error, count } =
        await query;

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        type,
        page,
        limit,
        total: count,
        totalPages: Math.ceil(
          (count || 0) / limit,
        ),
        data,
      });
    }

    return NextResponse.json(
      {
        error: "Invalid type",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Request failed",
      },
      {
        status: 500,
      },
    );
  }
}