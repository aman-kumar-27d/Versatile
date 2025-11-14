import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../../supabase/config';
import { Internship, Application } from '../../supabase/config';
import { ArrowLeft, Calendar, MapPin, DollarSign, Clock, Users, FileText, CheckCircle, XCircle