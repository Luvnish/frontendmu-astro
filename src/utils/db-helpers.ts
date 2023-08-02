import { supabase } from "./supabase";
import { userProfile } from "../store/userStore";
import type { User } from "./types";

/* User Profile Functions */

export const getUserProfile = async () => {
  const { data: profile, error } = await supabase.from("profiles").select("*");

  if (error) {
    console.log(error);
    return null;
  }

  return profile[0];
};

export const updateUserProfile = async (profile: Partial<User>) => {
  const userProfileData = userProfile.get();

  const { data, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", userProfileData?.id);

  if (error) {
    console.log(error);
    return null;
  }

  return data;
};

/* Meetup RSVP Functions */

export const getMeetupRSVPStatus = async (
  meetupId: string
): Promise<boolean> => {
  const userProfileData = userProfile.get();

  const { data, error } = await supabase
    .from("meetup_rsvp")
    .select("*")
    .eq("meetup_id", meetupId)
    .eq("user_uid", userProfileData?.id)
    .single()

  if (error) {
    console.log(error);
    return false;
  }

  return data && data.rsvp;
};

export const setMeetupRSVP = async (
  meetupId: string,
  rsvp: boolean,
  transport: string
) => {
  const userProfileData = userProfile.get();

  // check if user has already RSVP'd
  const { data: existingRSVP, error: existingRSVPError } = await supabase
    .from("meetup_rsvp")
    .select("*")
    .eq("meetup_id", meetupId)
    .eq("user_uid", userProfileData?.id);

  if (existingRSVPError) {
    console.log(existingRSVPError);
    return null;
  }

  // if user has already RSVP'd, update their RSVP
  if (existingRSVP[0]) {
    const { data, error } = await supabase
      .from("meetup_rsvp")
      .update({ rsvp, transport })
      .eq("id", existingRSVP[0].id)
      .select("*");

    if (error) {
      console.log(error);
      return null;
    }

    return { data };
  } else {
    // if user has not RSVP'd, create a new RSVP
    const { data, error } = await supabase
      .from("meetup_rsvp")
      .insert([
        {
          meetup_id: meetupId,
          user_uid: userProfileData?.id,
          user_metadata: userProfileData,
          rsvp,
          transport,
        },
      ])
      .select("*");

    if (error) {
      console.log(error);
      return null;
    }

    return { data };
  }
};